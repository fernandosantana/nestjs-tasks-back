import { PassportStrategy } from "@nestjs/passport"
import { Strategy, ExtractJwt } from "passport-jwt"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { UserRepository } from "../repository/user.repository"
import { InjectRepository } from "@nestjs/typeorm"
import { JwtPayload } from "../domain/jwt-payload.interface"
import config from 'config'
import { User } from "../domain/user.entity"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(UserRepository)
        private userRepositoy: UserRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>("jwt.secret")
        })
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { username } = payload
        const user = await this.userRepositoy.findOne({ username })

        if(!user) {
            throw new UnauthorizedException()
        }

        return user
    }
}