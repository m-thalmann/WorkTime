import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseConfigService } from './database-config.service';

describe('DatabaseConfigService', () => {
  let service: DatabaseConfigService;

  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseConfigService,

        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseConfigService>(DatabaseConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([
    ['type', 'DATABASE_TYPE', 'postgres'],
    ['host', 'DATABASE_HOST', '0.0.0.0'],
    ['port', 'DATABASE_PORT', '1234'],
    ['username', 'DATABASE_USERNAME', 'test'],
    ['password', 'DATABASE_PASSWORD', '123'],
    ['database', 'DATABASE_DATABASE', 'my-database'],
  ])('should return the %s with env-key "%s"', (property: string, envKey: string, expectedReturnValue: unknown) => {
    (mockConfigService.get as jest.Mock).mockReturnValue(expectedReturnValue);

    const value = service[property as keyof DatabaseConfigService];

    expect(value).toEqual(expectedReturnValue);
    expect(mockConfigService.get).toHaveBeenCalledWith(envKey);
  });

  it.each([
    ['type', DatabaseConfigService.DEFAULT_TYPE],
    ['host', DatabaseConfigService.DEFAULT_HOST],
    ['username', DatabaseConfigService.DEFAULT_USERNAME],
    ['password', DatabaseConfigService.DEFAULT_PASSWORD],
    ['database', DatabaseConfigService.DEFAULT_DATABASE],
  ])('should return the default value for the %s', (property: string, defaultValue: unknown) => {
    (mockConfigService.get as jest.Mock).mockReturnValue(undefined);

    const value = service[property as keyof DatabaseConfigService];

    expect(value).toEqual(defaultValue);
  });
});
