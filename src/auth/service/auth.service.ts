import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt from "bcryptjs"
import { UserRepository } from '../repository/user.repository';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { User } from '../domain/user.entity';
import { JwtPayload } from '../domain/jwt-payload.interface';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService
    ){}

    async signUp(authCredentials: AuthCredentialsDto): Promise<void> {
        const { username, password } = authCredentials

        const user = new User()
        user.username = username
        user.salt = await bcrypt.genSalt()
        user.password = await this.hashPassword(password, user.salt)

        try {
            await this.userRepository.save(user)
        } catch(error) {
            if(error.code === "23505"){
                throw new ConflictException("Username already exists")
            } 
            
            throw new InternalServerErrorException()
        }
    }

    async signIn(authCredentials: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const username = await this.validateUserPassword(authCredentials)

        if(!username) {
            throw new UnauthorizedException("Invalid credentials") 
        }

        const payload: JwtPayload = { username }
        const accessToken = this.jwtService.sign(payload)

        return { accessToken }
    }

    async validateUserPassword(authCredentials: AuthCredentialsDto): Promise<string> {
        const { username, password } = authCredentials
        const user = await this.userRepository.findOne({ username })

        if(user && await user.validatePassword(password)) {
            return user.username
        }

        return null
    }

    async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt)
    }
}
