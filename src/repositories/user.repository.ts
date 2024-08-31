import prisma from "@/configs/prisma";

const UserRepository = {
  async saveIfNotExists(email: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) return user;
    // If not exists, create user
    const newUser = await prisma.user.create({ data: { email } });
    return newUser;
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async updateRefreshToken(id: string, refreshToken: string) {
    return await prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  },
};

export default UserRepository;
