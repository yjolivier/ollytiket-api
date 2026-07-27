import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Manager } from '../managers/manager.entity';
import { normalizePhone } from '../common/phone.util';
import { PhoneDto } from './dto/phone.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const PIN_SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/** No WhatsApp/SMS provider is wired up yet — the demo OTP is fixed (see design handoff). */
const DEMO_OTP_CODE = '0000';
const VERIFICATION_TOKEN_TTL = '10m';
const VERIFICATION_PURPOSE = 'phone-verification';

export interface JwtPayload {
  sub: string;
  phone: string;
}

interface VerificationTokenPayload {
  phone: string;
  purpose: typeof VERIFICATION_PURPOSE;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Manager)
    private readonly managers: Repository<Manager>,
    private readonly jwt: JwtService,
  ) {}

  async checkPhone(dto: PhoneDto): Promise<{ exists: boolean; name?: string }> {
    const phone = normalizePhone(dto.phone);
    const manager = await this.managers.findOne({ where: { phone } });
    return manager ? { exists: true, name: manager.name } : { exists: false };
  }

  async sendOtp(dto: PhoneDto): Promise<void> {
    const phone = normalizePhone(dto.phone);
    const existing = await this.managers.findOne({ where: { phone } });
    if (existing) {
      throw new ConflictException('Ce numéro est déjà utilisé.');
    }
    // No WhatsApp/SMS provider wired up — demo OTP is fixed (see design handoff).
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ verificationToken: string }> {
    const phone = normalizePhone(dto.phone);
    if (dto.code !== DEMO_OTP_CODE) {
      throw new UnauthorizedException('Code incorrect.');
    }

    const payload: VerificationTokenPayload = {
      phone,
      purpose: VERIFICATION_PURPOSE,
    };
    const verificationToken = await this.jwt.signAsync(payload, {
      expiresIn: VERIFICATION_TOKEN_TTL,
    });
    return { verificationToken };
  }

  async register(dto: RegisterDto) {
    const phone = normalizePhone(dto.phone);

    let payload: VerificationTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<VerificationTokenPayload>(
        dto.verificationToken,
      );
    } catch {
      throw new UnauthorizedException('Vérification expirée, recommencez.');
    }
    if (payload.purpose !== VERIFICATION_PURPOSE || payload.phone !== phone) {
      throw new UnauthorizedException('Vérification invalide, recommencez.');
    }

    const existing = await this.managers.findOne({ where: { phone } });
    if (existing) {
      throw new ConflictException('Ce numéro est déjà utilisé.');
    }

    const manager = this.managers.create({
      phone,
      name: dto.name,
      pinHash: await bcrypt.hash(dto.pin, PIN_SALT_ROUNDS),
    });
    await this.managers.save(manager);

    return this.buildSession(manager);
  }

  async login(dto: LoginDto) {
    const phone = normalizePhone(dto.phone);
    const manager = await this.managers.findOne({ where: { phone } });
    if (!manager) {
      throw new UnauthorizedException('Numéro ou code secret incorrect.');
    }

    if (manager.lockedUntil && manager.lockedUntil.getTime() > Date.now()) {
      throw new HttpException(
        'Trop de tentatives. Réessayez dans quelques minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const pinMatches = await bcrypt.compare(dto.pin, manager.pinHash);
    if (!pinMatches) {
      manager.failedAttempts += 1;
      if (manager.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        manager.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60_000);
        manager.failedAttempts = 0;
      }
      await this.managers.save(manager);
      throw new UnauthorizedException('Numéro ou code secret incorrect.');
    }

    manager.failedAttempts = 0;
    manager.lockedUntil = null;
    await this.managers.save(manager);

    return this.buildSession(manager);
  }

  private async buildSession(manager: Manager) {
    const payload: JwtPayload = { sub: manager.id, phone: manager.phone };
    return {
      accessToken: await this.jwt.signAsync(payload),
      manager: {
        id: manager.id,
        name: manager.name,
        phone: manager.phone,
      },
    };
  }
}
