import { Test } from "@nestjs/testing"
import { UserRepository } from "../src/auth/repository/user.repository"
import { JwtService } from "@nestjs/jwt"
import { AuthCredentialsDto } from "../src/auth/dto/auth-credentials.dto"
import { ConflictException, InternalServerErrorException } from "@nestjs/common"
import bcrypt from 'bcryptjs'
import { AuthService } from "../src/auth/service/auth.service"
import { User } from "../src/auth/domain/user.entity"

const mockCredentials: AuthCredentialsDto = { username: "username", password: "password" }
const mockJwtService = () => ({})
const mockUserRepository = () => ({
    save: jest.fn(),
    findOne: jest.fn(),
})

describe("AuthService", () => {
    let authService: AuthService
    let userRepository: UserRepository

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserRepository,
                    useFactory: mockUserRepository
                },
                {
                    provide: JwtService,
                    useFactory: mockJwtService
                }
            ]
        }).compile()

        authService = module.get<AuthService>(AuthService)
        userRepository = module.get<UserRepository>(UserRepository)
    })

    describe("signUp", () => {
        it("successfully signs up the user", () => {
            jest.spyOn(userRepository, "save").mockResolvedValue(undefined)
            expect(authService.signUp(mockCredentials)).resolves.not.toThrow()
        })

        it("throws a conflict exception as username already exists", () => {
            jest.spyOn(userRepository, "save").mockRejectedValue({ code: "23505" })
            expect(authService.signUp(mockCredentials)).rejects.toThrow(ConflictException)
        })

        it("throws a internal exception as unknown code error", () => {
            jest.spyOn(userRepository, "save").mockRejectedValue({ code: "00000" })
            expect(authService.signUp(mockCredentials)).rejects.toThrow(InternalServerErrorException)
        })
    })

    describe("validateValidatePassword", () => {
        let user: User

        beforeEach(() => {
            user = new User()
            user.username = "username"
            user.validatePassword = jest.fn()
        })

        it("returns the username as validation is successfull", async () => {
            jest.spyOn(userRepository, "findOne").mockResolvedValue(user)
            jest.spyOn(user, "validatePassword").mockResolvedValue(true)

            const result = await authService.validateUserPassword(mockCredentials)
            expect(result).toBe(user.username)
        })

        it("returns null as user cannot be found", async () => {
            jest.spyOn(userRepository, "findOne").mockResolvedValue(null)
            
            const result = await authService.validateUserPassword(mockCredentials)

            expect(user.validatePassword).not.toHaveBeenCalled()
            expect(result).toBeNull()
        })

        it("returns null as password is invalid", async () => {
            jest.spyOn(userRepository, "findOne").mockResolvedValue(user)
            jest.spyOn(user, "validatePassword").mockResolvedValue(false)

            const result = await authService.validateUserPassword(mockCredentials)

            expect(user.validatePassword).toHaveBeenCalled()
            expect(result).toBeNull()
        })
    })

    describe("hashPassword", () => {
        it("calls bcrypt.hash to generate a hash", async () => {
            bcrypt.hash = jest.fn().mockResolvedValue("hashhash")
            expect(bcrypt.hash).not.toHaveBeenCalled()

            const result = await authService.hashPassword("testPassword", "TestSalt")

            expect(bcrypt.hash).toHaveBeenCalledWith("testPassword", "TestSalt")
            expect(result).toBe("hashhash")
        })
    })

})