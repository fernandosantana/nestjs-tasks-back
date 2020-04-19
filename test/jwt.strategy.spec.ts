import { Test } from "@nestjs/testing"
import { JwtStrategy } from "../src/auth/service/jwt.strategy"
import { UserRepository } from "../src/auth/repository/user.repository"
import { UnauthorizedException } from "@nestjs/common"
import { User } from "../src/auth/domain/user.entity"

const mockUserRepository = () => ({
    findOne: jest.fn(),
})

describe("JwtStragegy", () => {
    let jwtStrategy: JwtStrategy
    let userRepository: UserRepository

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                {
                    provide: UserRepository,
                    useFactory: mockUserRepository
                }
            ]
        }).compile()

        jwtStrategy = module.get<JwtStrategy>(JwtStrategy)
        userRepository = module.get<UserRepository>(UserRepository)
    })

    describe("validate", () => {
        it("validate and return the user based on JWT payload", async () => {
            const user = new User()
            user.username = "TestUser"

            jest.spyOn(userRepository, "findOne").mockResolvedValue(user)

            const result = await jwtStrategy.validate({ username: "TestUser"})
            expect(userRepository.findOne).toHaveBeenCalledWith({ username: "TestUser" })
            expect(result).toEqual(user)
        })

        it("throws a unauthorized exception as user cannot be found", async () => {
            jest.spyOn(userRepository, "findOne").mockResolvedValue(null)
            expect(jwtStrategy.validate({ username: "TestUser" })).rejects.toThrow(UnauthorizedException)
        })
    })
})