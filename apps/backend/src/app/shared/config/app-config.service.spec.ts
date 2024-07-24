import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigService } from './app-config.service';

const mockPort = 1234;

describe('AppConfigService', () => {
  let service: AppConfigService;

  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppConfigService,

        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([
    ['port', 'APP_PORT', mockPort],
    ['prefix', 'APP_PREFIX', 'test-api'],
  ])('should return the %s with env-key "%s"', (property: string, envKey: string, expectedReturnValue: unknown) => {
    (mockConfigService.get as jest.Mock).mockReturnValue(expectedReturnValue);

    const value = service[property as keyof AppConfigService];

    expect(value).toEqual(expectedReturnValue);
    expect(mockConfigService.get).toHaveBeenCalledWith(envKey);
  });

  it.each([
    ['port', AppConfigService.DEFAULT_PORT],
    ['prefix', AppConfigService.DEFAULT_PREFIX],
  ])('should return the default value for the %s', (property: string, defaultValue: unknown) => {
    (mockConfigService.get as jest.Mock).mockReturnValue(undefined);

    const value = service[property as keyof AppConfigService];

    expect(value).toEqual(defaultValue);
  });
});
