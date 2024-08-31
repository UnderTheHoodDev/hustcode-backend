import UserRepository from "@/repositories/user.repository";

const UserService = {
  async getUserById(id: string) {
    return await UserRepository.findById(id as string);
  },
};

export default UserService;
