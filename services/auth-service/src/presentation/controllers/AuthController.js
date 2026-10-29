import { createApiResponse } from '@tokonusa/common';

export class AuthController {
  constructor({
    registerUserUseCase,
    loginUserUseCase,
    getUserProfileUseCase,
    addAddressUseCase,
  }) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
    this.getUserProfileUseCase = getUserProfileUseCase;
    this.addAddressUseCase = addAddressUseCase;
  }

  register = async (req, res, next) => {
    try {
      const data = await this.registerUserUseCase.execute(req.body);
      res.status(201).json(createApiResponse(true, data));
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const data = await this.loginUserUseCase.execute(req.body);
      res.status(200).json(createApiResponse(true, data));
    } catch (err) {
      next(err);
    }
  };

  getProfile = async (req, res, next) => {
    try {
      const data = await this.getUserProfileUseCase.execute(req.user.id);
      res.status(200).json(createApiResponse(true, data));
    } catch (err) {
      next(err);
    }
  };

  addAddress = async (req, res, next) => {
    try {
      const data = await this.addAddressUseCase.execute({
        userId: req.user.id,
        ...req.body,
      });
      res.status(201).json(createApiResponse(true, data));
    } catch (err) {
      next(err);
    }
  };
}
