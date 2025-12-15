import { mock } from 'jest-mock-extended';
import type {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	IExecuteFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const mockClient = mock<RedisClient>();
const createClient = jest.fn().mockReturnValue(mockClient);
jest.mock('redis', () => ({ createClient }));

import { RedisEnhanced } from '../RedisEnhanced.node';
import type { RedisClient } from '../types';
import { redisConnectionTest, setupRedisClient } from '../utils';

describe('RedisEnhanced Node', () => {
	const node = new RedisEnhanced();

	beforeEach(() => {
		jest.clearAllMocks();
		createClient.mockReturnValue(mockClient);
	});

	afterEach(() => jest.resetAllMocks());

	describe('setupRedisClient', () => {
		it('should not configure TLS by default', () => {
			setupRedisClient({
				host: 'redis.domain',
				port: 1234,
				database: 0,
			});
			expect(createClient).toHaveBeenCalledWith({
				database: 0,
				username: undefined,
				password: undefined,
				socket: {
					host: 'redis.domain',
					port: 1234,
				},
			});
		});

		it('should configure TLS', () => {
			setupRedisClient({
				host: 'redis.domain',
				port: 1234,
				database: 0,
				ssl: true,
			});
			expect(createClient).toHaveBeenCalledWith({
				database: 0,
				username: undefined,
				password: undefined,
				socket: {
					host: 'redis.domain',
					port: 1234,
					tls: true,
				},
			});
		});

		it('should set user on auth', () => {
			setupRedisClient({
				host: 'redis.domain',
				port: 1234,
				database: 0,
				user: 'test_user',
				password: 'test_password',
			});
			expect(createClient).toHaveBeenCalledWith({
				database: 0,
				username: 'test_user',
				password: 'test_password',
				socket: {
					host: 'redis.domain',
					port: 1234,
				},
			});
		});
	});

	describe('redisConnectionTest', () => {
		const thisArg = mock<ICredentialTestFunctions>({});
		const credentials = mock<ICredentialsDecrypted>({
			data: {
				host: 'localhost',
				port: 6379,
				user: 'username',
				password: 'password',
				database: 0,
			},
		});
		const redisOptions = {
			socket: {
				host: 'localhost',
				port: 6379,
			},
			database: 0,
			username: 'username',
			password: 'password',
		};

		it('should return success when connection is established', async () => {
			const result = await redisConnectionTest.call(thisArg, credentials);

			expect(result).toEqual({
				status: 'OK',
				message: 'Connection successful!',
			});
			expect(createClient).toHaveBeenCalledWith(redisOptions);
			expect(mockClient.connect).toHaveBeenCalled();
			expect(mockClient.ping).toHaveBeenCalled();
		});

		it('should return error when connection fails', async () => {
			mockClient.connect.mockRejectedValue(new Error('Connection failed'));

			const result = await redisConnectionTest.call(thisArg, credentials);

			expect(result).toEqual({
				status: 'Error',
				message: 'Connection failed',
			});
			expect(createClient).toHaveBeenCalledWith(redisOptions);
			expect(mockClient.connect).toHaveBeenCalled();
			expect(mockClient.ping).not.toHaveBeenCalled();
		});
	});

	describe('Node Definition', () => {
		it('should have correct node properties', () => {
			expect(node.description.displayName).toBe('Redis Enhanced');
			expect(node.description.name).toBe('redisEnhanced');
			expect(node.description.group).toContain('input');
			expect(node.description.version).toBe(1);
		});

		it('should have all Redis operations', () => {
			const operations = node.description.properties[0].options;
			const operationValues = operations?.map((op: any) => op.value);

			// Check for key operations (all 35 operations)
			expect(operationValues).toContain('append');
			expect(operationValues).toContain('blpop');
			expect(operationValues).toContain('brpop');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('eval');
			expect(operationValues).toContain('exists');
			expect(operationValues).toContain('expireat');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('getset');
			expect(operationValues).toContain('hexists');
			expect(operationValues).toContain('hget');
			expect(operationValues).toContain('hkeys');
			expect(operationValues).toContain('hlen');
			expect(operationValues).toContain('hset');
			expect(operationValues).toContain('hvals');
			expect(operationValues).toContain('hmget');
			expect(operationValues).toContain('incr');
			expect(operationValues).toContain('info');
			expect(operationValues).toContain('keys');
			expect(operationValues).toContain('llen');
			expect(operationValues).toContain('lrange');
			expect(operationValues).toContain('lrem');
			expect(operationValues).toContain('lset');
			expect(operationValues).toContain('ltrim');
			expect(operationValues).toContain('mget');
			expect(operationValues).toContain('mset');
			expect(operationValues).toContain('persist');
			expect(operationValues).toContain('pop');
			expect(operationValues).toContain('publish');
			expect(operationValues).toContain('push');
			expect(operationValues).toContain('scan');
			expect(operationValues).toContain('set');
			expect(operationValues).toContain('sadd');
			expect(operationValues).toContain('scard');
			expect(operationValues).toContain('sismember');
			expect(operationValues).toContain('srem');
			expect(operationValues).toContain('strlen');
			expect(operationValues).toContain('ttl');
			expect(operationValues).toContain('zadd');
			expect(operationValues).toContain('zcard');
			expect(operationValues).toContain('zrange');
			expect(operationValues).toContain('zrem');

			// Verify total operations count
			expect(operationValues).toHaveLength(44);
		});

		it('should have Redis credentials configured', () => {
			const credentials = node.description.credentials;
			expect(credentials).toHaveLength(1);
			expect(credentials![0].name).toBe('redis');
			expect(credentials![0].required).toBe(true);
			expect(credentials![0].testedBy).toBe('redisConnectionTest');
		});
	});

	describe('operations', () => {
		const thisArg = mock<IExecuteFunctions>({});

		beforeEach(() => {
			setupRedisClient({
				host: 'redis.domain',
				port: 1234,
				database: 0,
				ssl: true,
			});

			const mockCredential = {
				host: 'redis',
				port: 1234,
				database: 0,
				password: 'random',
			};

			thisArg.getCredentials.calledWith('redis').mockResolvedValue(mockCredential);
		});

		afterEach(() => {
			expect(createClient).toHaveBeenCalled();
			expect(mockClient.connect).toHaveBeenCalled();
			expect(mockClient.ping).toHaveBeenCalled();
			expect(mockClient.quit).toHaveBeenCalled();
		});

		describe('info operation', () => {
			it('should return info', async () => {
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('info');
				mockClient.info.mockResolvedValue(`
# Server
redis_version:6.2.14
redis_git_sha1:00000000
redis_git_dirty:0
redis_mode:standalone
arch_bits:64
tcp_port:6379
uptime_in_seconds:429905
uptime_in_days:4

# Clients
connected_clients:1
cluster_connections:0
max_clients:10000

# Memory
used_memory:876648

# Replication
role:master
connected_slaves:0
master_failover_state:no-failover
	`);

				const output = await node.execute.call(thisArg);

				expect(mockClient.info).toHaveBeenCalled();
				expect(output[0][0].json).toEqual({
					redis_version: 6.2,
					redis_git_sha1: 0,
					redis_git_dirty: 0,
					redis_mode: 'standalone',
					arch_bits: 64,
					tcp_port: 6379,
					uptime_in_seconds: 429905,
					uptime_in_days: 4,
					connected_clients: 1,
					cluster_connections: 0,
					max_clients: 10000,
					used_memory: 876648,
					role: 'master',
					connected_slaves: 0,
					master_failover_state: 'no-failover',
				});
			});

			it('should continue and return an error when continue on fail is enabled and an error is thrown', async () => {
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('info');
				thisArg.continueOnFail.mockReturnValue(true);
				mockClient.info.mockRejectedValue(new Error('Redis error'));

				const output = await node.execute.call(thisArg);

				expect(mockClient.info).toHaveBeenCalled();
				expect(output[0][0].json).toEqual({ error: 'Redis error' });
			});

			it('should throw an error when continue on fail is disabled and an error is thrown', async () => {
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('info');
				thisArg.continueOnFail.mockReturnValue(false);
				mockClient.info.mockRejectedValue(new Error('Redis error'));

				await expect(node.execute.call(thisArg)).rejects.toThrow(NodeOperationError);

				expect(mockClient.info).toHaveBeenCalled();
				expect(mockClient.quit).toHaveBeenCalled();
			});
		});

		describe('delete operation', () => {
			it('should delete single key', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('delete');
				thisArg.getNodeParameter.calledWith('key', 0).mockReturnValue('key1');
				mockClient.del.mockResolvedValue(1);

				const output = await node.execute.call(thisArg);
				expect(mockClient.del).toHaveBeenCalledWith(['key1']);
				expect(output[0][0].json).toEqual({ 
					deletedKeys: ['key1'], 
					deletedCount: 1 
				});
			});

			it('should delete multiple keys', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('delete');
				thisArg.getNodeParameter.calledWith('key', 0).mockReturnValue('key1 key2 key3');
				mockClient.del.mockResolvedValue(3);

				const output = await node.execute.call(thisArg);
				expect(mockClient.del).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
				expect(output[0][0].json).toEqual({ 
					deletedKeys: ['key1', 'key2', 'key3'], 
					deletedCount: 3 
				});
			});

			it('should handle keys with extra spaces', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('delete');
				thisArg.getNodeParameter.calledWith('key', 0).mockReturnValue('  key1   key2  key3  ');
				mockClient.del.mockResolvedValue(2);

				const output = await node.execute.call(thisArg);
				expect(mockClient.del).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
				expect(output[0][0].json).toEqual({ 
					deletedKeys: ['key1', 'key2', 'key3'], 
					deletedCount: 2 
				});
			});

			it('should handle partial deletion (some keys dont exist)', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('delete');
				thisArg.getNodeParameter.calledWith('key', 0).mockReturnValue('existing_key nonexistent_key');
				mockClient.del.mockResolvedValue(1);

				const output = await node.execute.call(thisArg);
				expect(mockClient.del).toHaveBeenCalledWith(['existing_key', 'nonexistent_key']);
				expect(output[0][0].json).toEqual({ 
					deletedKeys: ['existing_key', 'nonexistent_key'], 
					deletedCount: 1 
				});
			});

			it('should continue and return an error when continue on fail is enabled and an error is thrown', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('delete');
				thisArg.getNodeParameter.calledWith('key', 0).mockReturnValue('key1');
				thisArg.continueOnFail.mockReturnValue(true);

				mockClient.del.mockRejectedValue(new Error('Redis error'));

				const output = await node.execute.call(thisArg);

				expect(mockClient.del).toHaveBeenCalled();
				expect(output[0][0].json).toEqual({ error: 'Redis error' });
			});

			it('should throw an error when continue on fail is disabled and an error is thrown', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('delete');
				thisArg.getNodeParameter.calledWith('key', 0).mockReturnValue('key1');

				mockClient.del.mockRejectedValue(new Error('Redis error'));

				await expect(node.execute.call(thisArg)).rejects.toThrow(NodeOperationError);

				expect(mockClient.del).toHaveBeenCalled();
				expect(mockClient.quit).toHaveBeenCalled();
			});
		});

		describe('get operation', () => {
			beforeEach(() => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('get');
				thisArg.getNodeParameter.calledWith('options', 0).mockReturnValue({ dotNotation: true });
				thisArg.getNodeParameter.calledWith('key', 0).mockReturnValue('key1');
				thisArg.getNodeParameter.calledWith('propertyName', 0).mockReturnValue('x.y');
			});

			it('keyType = automatic', async () => {
				thisArg.getNodeParameter.calledWith('keyType', 0).mockReturnValue('automatic');
				mockClient.type.calledWith('key1').mockResolvedValue('string');
				mockClient.get.calledWith('key1').mockResolvedValue('value');

				const output = await node.execute.call(thisArg);
				expect(mockClient.type).toHaveBeenCalledWith('key1');
				expect(mockClient.get).toHaveBeenCalledWith('key1');
				expect(output[0][0].json).toEqual({ x: { y: 'value' } });
			});

			it('keyType = hash', async () => {
				thisArg.getNodeParameter.calledWith('keyType', 0).mockReturnValue('hash');
				mockClient.hGetAll.calledWith('key1').mockResolvedValue({
					field1: '1',
					field2: '2',
				});

				const output = await node.execute.call(thisArg);
				expect(mockClient.hGetAll).toHaveBeenCalledWith('key1');
				expect(output[0][0].json).toEqual({
					x: {
						y: {
							field1: '1',
							field2: '2',
						},
					},
				});
			});

			it('should continue and return an error when continue on fail is enabled and an error is thrown', async () => {
				thisArg.getNodeParameter.calledWith('keyType', 0).mockReturnValue('automatic');
				thisArg.continueOnFail.mockReturnValue(true);

				mockClient.type.calledWith('key1').mockResolvedValue('string');
				mockClient.get.mockRejectedValue(new Error('Redis error'));

				const output = await node.execute.call(thisArg);
				expect(mockClient.get).toHaveBeenCalled();

				expect(output[0][0].json).toEqual({ error: 'Redis error' });
			});

			it('should throw an error when continue on fail is disabled and an error is thrown', async () => {
				thisArg.getNodeParameter.calledWith('keyType', 0).mockReturnValue('automatic');

				mockClient.type.calledWith('key1').mockResolvedValue('string');
				mockClient.get.mockRejectedValue(new Error('Redis error'));

				await expect(node.execute.call(thisArg)).rejects.toThrow(NodeOperationError);

				expect(mockClient.get).toHaveBeenCalled();
				expect(mockClient.quit).toHaveBeenCalled();
			});
		});

		describe('set operation', () => {
			beforeEach(() => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('set');
				thisArg.getNodeParameter.calledWith('key', 0).mockReturnValue('key1');
				thisArg.getNodeParameter.calledWith('value', 0).mockReturnValue('value1');
				thisArg.getNodeParameter.calledWith('keyType', 0).mockReturnValue('string');
				thisArg.getNodeParameter.calledWith('valueIsJSON', 0).mockReturnValue(false);
				thisArg.getNodeParameter.calledWith('expire', 0).mockReturnValue(false);
				thisArg.getNodeParameter.calledWith('ttl', 0).mockReturnValue(-1);
				thisArg.getNodeParameter.calledWith('setMode', 0).mockReturnValue('always');
			});

			it('should set basic string value', async () => {
				mockClient.set.mockResolvedValue('OK');

				const output = await node.execute.call(thisArg);
				expect(mockClient.set).toHaveBeenCalledWith('key1', 'value1');
				expect(output[0][0].json).toEqual({ 
					x: 1, 
					redis_result: { success: true, operation: 'SET ALWAYS', key: 'key1' }
				});
			});

			it('should set with expiration', async () => {
				thisArg.getNodeParameter.calledWith('expire', 0).mockReturnValue(true);
				thisArg.getNodeParameter.calledWith('ttl', 0).mockReturnValue(300);
				mockClient.set.mockResolvedValue('OK');

				const output = await node.execute.call(thisArg);
				expect(mockClient.set).toHaveBeenCalledWith('key1', 'value1', { EX: 300 });
				expect(output[0][0].json).toEqual({ 
					x: 1, 
					redis_result: { success: true, operation: 'SET ALWAYS', key: 'key1' }
				});
			});

			it('should set with NX mode', async () => {
				thisArg.getNodeParameter.calledWith('setMode', 0).mockReturnValue('nx');
				mockClient.set.mockResolvedValue('OK');

				const output = await node.execute.call(thisArg);
				expect(mockClient.set).toHaveBeenCalledWith('key1', 'value1', { NX: true });
				expect(output[0][0].json).toEqual({ 
					x: 1, 
					redis_result: { success: true, operation: 'SET NX', key: 'key1' }
				});
			});

			it('should set with XX mode', async () => {
				thisArg.getNodeParameter.calledWith('setMode', 0).mockReturnValue('xx');
				mockClient.set.mockResolvedValue('OK');

				const output = await node.execute.call(thisArg);
				expect(mockClient.set).toHaveBeenCalledWith('key1', 'value1', { XX: true });
				expect(output[0][0].json).toEqual({ 
					x: 1, 
					redis_result: { success: true, operation: 'SET XX', key: 'key1' }
				});
			});

			it('should handle NX mode failure when key already exists', async () => {
				thisArg.getNodeParameter.calledWith('setMode', 0).mockReturnValue('nx');
				mockClient.set.mockResolvedValue(null);

				const output = await node.execute.call(thisArg);
				expect(mockClient.set).toHaveBeenCalledWith('key1', 'value1', { NX: true });
				expect(output[0][0].json).toEqual({ 
					x: 1, 
					redis_result: { 
						success: false, 
						operation: 'SET NX', 
						key: 'key1',
						reason: 'key_already_exists',
						message: 'SET NX condition not met: key "key1" already exists'
					}
				});
			});

			it('should handle XX mode failure when key does not exist', async () => {
				thisArg.getNodeParameter.calledWith('setMode', 0).mockReturnValue('xx');
				mockClient.set.mockResolvedValue(null);

				const output = await node.execute.call(thisArg);
				expect(mockClient.set).toHaveBeenCalledWith('key1', 'value1', { XX: true });
				expect(output[0][0].json).toEqual({ 
					x: 1, 
					redis_result: { 
						success: false, 
						operation: 'SET XX', 
						key: 'key1',
						reason: 'key_does_not_exist',
						message: 'SET XX condition not met: key "key1" does not exist'
					}
				});
			});
		});

		describe('exists operation', () => {
			it('should check if keys exist', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('exists');
				thisArg.getNodeParameter.calledWith('keys', 0).mockReturnValue('key1 key2 key3');
			mockClient.exists.mockResolvedValue(2);

				const output = await node.execute.call(thisArg);
			expect(mockClient.exists).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
				expect(output[0][0].json).toEqual({ exists: 2, keys: ['key1', 'key2', 'key3'] });
			});
		});

		describe('mget operation', () => {
			it('should get multiple string keys using Redis native MGET', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('mget');
				thisArg.getNodeParameter.calledWith('keys', 0).mockReturnValue('key1 key2 key3');
				
				// Mock Redis native mGet
				mockClient.mGet.mockResolvedValue(['value1', 'value2', null]);

				const output = await node.execute.call(thisArg);
				
				// Verify mGet was called with key array
				expect(mockClient.mGet).toHaveBeenCalledWith(['key1', 'key2', 'key3']);
				
				expect(output[0][0].json).toEqual({
					key1: 'value1',
					key2: 'value2',
					key3: null
				});
			});
		});

		describe('mxget operation', () => {
			it('should get multiple keys with automatic type detection', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('mxget');
				thisArg.getNodeParameter.calledWith('keys', 0).mockReturnValue('key1 key2 key3');
				
				// Mock type detection for each key
				mockClient.type.calledWith('key1').mockResolvedValue('string');
				mockClient.type.calledWith('key2').mockResolvedValue('hash');
				mockClient.type.calledWith('key3').mockResolvedValue('list');
				
				// Mock responses for different types
				mockClient.get.calledWith('key1').mockResolvedValue('value1');
				mockClient.hGetAll.calledWith('key2').mockResolvedValue({ field1: 'value1', field2: 'value2' });
				mockClient.lRange.calledWith('key3', 0, -1).mockResolvedValue(['item1', 'item2']);

				const output = await node.execute.call(thisArg);
				
				// Verify type detection was called for each key
				expect(mockClient.type).toHaveBeenCalledWith('key1');
				expect(mockClient.type).toHaveBeenCalledWith('key2');
				expect(mockClient.type).toHaveBeenCalledWith('key3');
				
				// Verify appropriate get methods were called
				expect(mockClient.get).toHaveBeenCalledWith('key1');
				expect(mockClient.hGetAll).toHaveBeenCalledWith('key2');
				expect(mockClient.lRange).toHaveBeenCalledWith('key3', 0, -1);
				
				expect(output[0][0].json).toEqual({
					key1: 'value1',
					key2: { field1: 'value1', field2: 'value2' },
					key3: ['item1', 'item2']
				});
			});
		});

		describe('mset operation', () => {
			it('should set multiple string keys using Redis native MSET', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('mset');
				thisArg.getNodeParameter.calledWith('keyValuePairs', 0).mockReturnValue('key1 value1 key2 value2');
				mockClient.mSet.mockResolvedValue('OK');

				const output = await node.execute.call(thisArg);
				expect(mockClient.mSet).toHaveBeenCalledWith({ key1: 'value1', key2: 'value2' });
				expect(output[0][0].json).toEqual({ x: 1 });
			});

			it('should validate odd number of arguments', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('mset');
				thisArg.getNodeParameter.calledWith('keyValuePairs', 0).mockReturnValue('key1 value1 key2');

				await expect(node.execute.call(thisArg)).rejects.toThrow(
					'Key-value pairs must be even number of arguments'
				);
			});
		});

		describe('mxset operation', () => {
			it('should set multiple mixed-type keys with JSON parsing', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('mxset');
				thisArg.getNodeParameter.calledWith('keyValuePairs', 0).mockReturnValue('key1 "stringval" key2 {"field":"value"} key3 ["item1","item2"]');
				
				// Mock setValue calls
				mockClient.set.mockResolvedValue('OK');
				mockClient.hSet.mockResolvedValue(1);
				mockClient.lSet.mockResolvedValue('OK');

				const output = await node.execute.call(thisArg);
				
				// Verify different set operations were called based on data types
				expect(mockClient.set).toHaveBeenCalledWith('key1', 'stringval');
				expect(mockClient.hSet).toHaveBeenCalledWith('key2', 'field', 'value');
				// For arrays, lSet would be called for each index
				expect(mockClient.lSet).toHaveBeenCalledWith('key3', 0, 'item1');
				expect(mockClient.lSet).toHaveBeenCalledWith('key3', 1, 'item2');
				
				expect(output[0][0].json).toEqual({ x: 1 });
			});

			it('should validate odd number of arguments', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('mxset');
				thisArg.getNodeParameter.calledWith('keyValuePairs', 0).mockReturnValue('key1 "value1" key2');

				await expect(node.execute.call(thisArg)).rejects.toThrow(
					'Key-value pairs must be even number of arguments'
				);
			});
		});

		describe('scan operation', () => {
			it('should scan keys with pattern', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('scan');
				thisArg.getNodeParameter.calledWith('cursor', 0).mockReturnValue(0);
				thisArg.getNodeParameter.calledWith('pattern', 0).mockReturnValue('user:*');
				thisArg.getNodeParameter.calledWith('count', 0).mockReturnValue(10);
				mockClient.scan.mockResolvedValue({ cursor: '5', keys: ['user:1', 'user:2'] });

				const output = await node.execute.call(thisArg);
											expect(mockClient.scan).toHaveBeenCalledWith(0, { MATCH: 'user:*', COUNT: 10 });
				expect(output[0][0].json).toEqual({ cursor: '5', keys: ['user:1', 'user:2'] });
			});
		});

		describe('keys operation', () => {
			beforeEach(() => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('keys');
				thisArg.getNodeParameter.calledWith('keyPattern', 0).mockReturnValue('key*');
				mockClient.keys.calledWith('key*').mockResolvedValue(['key1', 'key2']);
			});

			it('getValues = false', async () => {
				thisArg.getNodeParameter.calledWith('getValues', 0).mockReturnValue(false);

				const output = await node.execute.call(thisArg);
				expect(mockClient.keys).toHaveBeenCalledWith('key*');
				expect(output[0][0].json).toEqual({ keys: ['key1', 'key2'] });
			});

			it('getValues = true', async () => {
				thisArg.getNodeParameter.calledWith('getValues', 0).mockReturnValue(true);
				mockClient.type.mockResolvedValue('string');
				mockClient.get.calledWith('key1').mockResolvedValue('value1');
				mockClient.get.calledWith('key2').mockResolvedValue('value2');

				const output = await node.execute.call(thisArg);
				expect(mockClient.keys).toHaveBeenCalledWith('key*');
				expect(output[0][0].json).toEqual({ key1: 'value1', key2: 'value2' });
			});

			it('should continue and return an error when continue on fail is enabled and an error is thrown', async () => {
				thisArg.continueOnFail.mockReturnValue(true);
				thisArg.getNodeParameter.calledWith('getValues', 0).mockReturnValue(true);

				mockClient.type.mockResolvedValue('string');
			mockClient.get.mockRejectedValue(new Error('Redis error'));

				const output = await node.execute.call(thisArg);
				expect(mockClient.get).toHaveBeenCalled();

				expect(output[0][0].json).toEqual({ error: 'Redis error' });
			});

			it('should throw an error when continue on fail is disabled and an error is thrown', async () => {
				thisArg.getNodeParameter.calledWith('getValues', 0).mockReturnValue(true);

				mockClient.type.mockResolvedValue('string');
			mockClient.get.mockRejectedValue(new Error('Redis error'));

				await expect(node.execute.call(thisArg)).rejects.toThrow(NodeOperationError);

				expect(mockClient.get).toHaveBeenCalled();
			expect(mockClient.quit).toHaveBeenCalled();
		});
	});

		describe('lrange operation', () => {
			it('should get range of elements from list', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('lrange');
				thisArg.getNodeParameter.calledWith('list', 0).mockReturnValue('mylist');
				thisArg.getNodeParameter.calledWith('start', 0).mockReturnValue(0);
				thisArg.getNodeParameter.calledWith('stop', 0).mockReturnValue(2);
				mockClient.lRange.mockResolvedValue(['element1', 'element2', 'element3']);

				const output = await node.execute.call(thisArg);
				
				expect(mockClient.lRange).toHaveBeenCalledWith('mylist', 0, 2);
				expect(output[0][0].json).toEqual({
					list: 'mylist',
					start: 0,
					stop: 2,
					elements: ['element1', 'element2', 'element3']
				});
			});

			it('should handle negative indices', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('lrange');
				thisArg.getNodeParameter.calledWith('list', 0).mockReturnValue('mylist');
				thisArg.getNodeParameter.calledWith('start', 0).mockReturnValue(-3);
				thisArg.getNodeParameter.calledWith('stop', 0).mockReturnValue(-1);
				mockClient.lRange.mockResolvedValue(['element1', 'element2', 'element3']);

				const output = await node.execute.call(thisArg);
				
				expect(mockClient.lRange).toHaveBeenCalledWith('mylist', -3, -1);
				expect(output[0][0].json).toEqual({
					list: 'mylist',
					start: -3,
					stop: -1,
					elements: ['element1', 'element2', 'element3']
				});
			});

			it('should handle empty list', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('lrange');
				thisArg.getNodeParameter.calledWith('list', 0).mockReturnValue('emptylist');
				thisArg.getNodeParameter.calledWith('start', 0).mockReturnValue(0);
				thisArg.getNodeParameter.calledWith('stop', 0).mockReturnValue(-1);
				mockClient.lRange.mockResolvedValue([]);

				const output = await node.execute.call(thisArg);

				expect(mockClient.lRange).toHaveBeenCalledWith('emptylist', 0, -1);
				expect(output[0][0].json).toEqual({
					list: 'emptylist',
					start: 0,
					stop: -1,
					elements: []
				});
			});
		});

		describe('lset operation', () => {
			it('should set list element at index', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('lset');
				thisArg.getNodeParameter.calledWith('list', 0).mockReturnValue('mylist');
				thisArg.getNodeParameter.calledWith('index', 0).mockReturnValue(2);
				thisArg.getNodeParameter.calledWith('value', 0).mockReturnValue('newvalue');
				mockClient.lSet.mockResolvedValue('OK');

				const output = await node.execute.call(thisArg);

				expect(mockClient.lSet).toHaveBeenCalledWith('mylist', 2, 'newvalue');
				expect(output[0][0].json).toEqual({
					list: 'mylist',
					index: 2,
					value: 'newvalue'
				});
			});

			it('should handle negative index', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('lset');
				thisArg.getNodeParameter.calledWith('list', 0).mockReturnValue('mylist');
				thisArg.getNodeParameter.calledWith('index', 0).mockReturnValue(-1);
				thisArg.getNodeParameter.calledWith('value', 0).mockReturnValue('lastvalue');
				mockClient.lSet.mockResolvedValue('OK');

				const output = await node.execute.call(thisArg);

				expect(mockClient.lSet).toHaveBeenCalledWith('mylist', -1, 'lastvalue');
				expect(output[0][0].json).toEqual({
					list: 'mylist',
					index: -1,
					value: 'lastvalue'
				});
			});
		});

		describe('ltrim operation', () => {
			it('should trim list to specified range', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('ltrim');
				thisArg.getNodeParameter.calledWith('list', 0).mockReturnValue('mylist');
				thisArg.getNodeParameter.calledWith('start', 0).mockReturnValue(0);
				thisArg.getNodeParameter.calledWith('stop', 0).mockReturnValue(4);
				mockClient.lTrim.mockResolvedValue('OK');

				const output = await node.execute.call(thisArg);

				expect(mockClient.lTrim).toHaveBeenCalledWith('mylist', 0, 4);
				expect(output[0][0].json).toEqual({
					list: 'mylist',
					start: 0,
					stop: 4,
					trimmed: true
				});
			});

			it('should handle negative indices', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('ltrim');
				thisArg.getNodeParameter.calledWith('list', 0).mockReturnValue('mylist');
				thisArg.getNodeParameter.calledWith('start', 0).mockReturnValue(-10);
				thisArg.getNodeParameter.calledWith('stop', 0).mockReturnValue(-1);
				mockClient.lTrim.mockResolvedValue('OK');

				const output = await node.execute.call(thisArg);

				expect(mockClient.lTrim).toHaveBeenCalledWith('mylist', -10, -1);
				expect(output[0][0].json).toEqual({
					list: 'mylist',
					start: -10,
					stop: -1,
					trimmed: true
				});
			});
		});

		describe('lrem operation', () => {
			it('should remove all occurrences when count is 0', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('lrem');
				thisArg.getNodeParameter.calledWith('list', 0).mockReturnValue('mylist');
				thisArg.getNodeParameter.calledWith('count', 0).mockReturnValue(0);
				thisArg.getNodeParameter.calledWith('value', 0).mockReturnValue('removeMe');
				mockClient.lRem.mockResolvedValue(3);

				const output = await node.execute.call(thisArg);

				expect(mockClient.lRem).toHaveBeenCalledWith('mylist', 0, 'removeMe');
				expect(output[0][0].json).toEqual({
					list: 'mylist',
					count: 0,
					value: 'removeMe',
					removed: 3
				});
			});

			it('should remove from head when count is positive', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('lrem');
				thisArg.getNodeParameter.calledWith('list', 0).mockReturnValue('mylist');
				thisArg.getNodeParameter.calledWith('count', 0).mockReturnValue(2);
				thisArg.getNodeParameter.calledWith('value', 0).mockReturnValue('value');
				mockClient.lRem.mockResolvedValue(2);

				const output = await node.execute.call(thisArg);

				expect(mockClient.lRem).toHaveBeenCalledWith('mylist', 2, 'value');
				expect(output[0][0].json).toEqual({
					list: 'mylist',
					count: 2,
					value: 'value',
					removed: 2
				});
			});

			it('should remove from tail when count is negative', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('lrem');
				thisArg.getNodeParameter.calledWith('list', 0).mockReturnValue('mylist');
				thisArg.getNodeParameter.calledWith('count', 0).mockReturnValue(-1);
				thisArg.getNodeParameter.calledWith('value', 0).mockReturnValue('value');
				mockClient.lRem.mockResolvedValue(1);

				const output = await node.execute.call(thisArg);

				expect(mockClient.lRem).toHaveBeenCalledWith('mylist', -1, 'value');
				expect(output[0][0].json).toEqual({
					list: 'mylist',
					count: -1,
					value: 'value',
					removed: 1
				});
			});
		});

		describe('hset operation', () => {
			it('should set hash field with string value', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('hset');
				thisArg.getNodeParameter.calledWith('hash', 0).mockReturnValue('myhash');
				thisArg.getNodeParameter.calledWith('field', 0).mockReturnValue('myfield');
				thisArg.getNodeParameter.calledWith('value', 0).mockReturnValue('myvalue');
				thisArg.getNodeParameter.calledWith('valueIsJSON', 0).mockReturnValue(false);
				mockClient.hSet.mockResolvedValue(1);

				const output = await node.execute.call(thisArg);
				
				expect(mockClient.hSet).toHaveBeenCalledWith('myhash', 'myfield', 'myvalue');
				expect(output[0][0].json).toEqual({
					hash: 'myhash',
					field: 'myfield',
					value: 'myvalue'
				});
			});

			it('should set hash field with JSON value', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('hset');
				thisArg.getNodeParameter.calledWith('hash', 0).mockReturnValue('myhash');
				thisArg.getNodeParameter.calledWith('field', 0).mockReturnValue('myfield');
				thisArg.getNodeParameter.calledWith('value', 0).mockReturnValue('{"key":"value"}');
				thisArg.getNodeParameter.calledWith('valueIsJSON', 0).mockReturnValue(true);
				mockClient.hSet.mockResolvedValue(1);

				const output = await node.execute.call(thisArg);
				
				expect(mockClient.hSet).toHaveBeenCalledWith('myhash', 'myfield', {"key":"value"});
				expect(output[0][0].json).toEqual({
					hash: 'myhash',
					field: 'myfield',
					value: {"key":"value"}
				});
			});
		});

		describe('hget operation', () => {
			it('should get hash field value', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('hget');
				thisArg.getNodeParameter.calledWith('hash', 0).mockReturnValue('myhash');
				thisArg.getNodeParameter.calledWith('field', 0).mockReturnValue('myfield');
				thisArg.getNodeParameter.calledWith('propertyName', 0).mockReturnValue('result');
				mockClient.hGet.mockResolvedValue('myvalue');

				const output = await node.execute.call(thisArg);
				
				expect(mockClient.hGet).toHaveBeenCalledWith('myhash', 'myfield');
				expect(output[0][0].json).toEqual({
					x: 1,
					result: 'myvalue'
				});
			});

			it('should handle non-existent field', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('hget');
				thisArg.getNodeParameter.calledWith('hash', 0).mockReturnValue('myhash');
				thisArg.getNodeParameter.calledWith('field', 0).mockReturnValue('nonexistent');
				thisArg.getNodeParameter.calledWith('propertyName', 0).mockReturnValue('result');
				mockClient.hGet.mockResolvedValue(null);

				const output = await node.execute.call(thisArg);
				
				expect(mockClient.hGet).toHaveBeenCalledWith('myhash', 'nonexistent');
				expect(output[0][0].json).toEqual({
					x: 1,
					result: null
				});
			});
		});

		describe('hmget operation', () => {
			it('should get multiple hash field values', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('hmget');
				thisArg.getNodeParameter.calledWith('hash', 0).mockReturnValue('myhash');
				thisArg.getNodeParameter.calledWith('fields', 0).mockReturnValue('field1 field2 field3');
				thisArg.getNodeParameter.calledWith('propertyName', 0).mockReturnValue('result');
				mockClient.hmGet.mockResolvedValue(['value1', 'value2', 'value3']);

				const output = await node.execute.call(thisArg);
				
				expect(mockClient.hmGet).toHaveBeenCalledWith('myhash', ['field1', 'field2', 'field3']);
				expect(output[0][0].json).toEqual({
					x: 1,
					result: {
						field1: 'value1',
						field2: 'value2',
						field3: 'value3'
					}
				});
			});

			it('should handle mixed existing/non-existing fields', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('hmget');
				thisArg.getNodeParameter.calledWith('hash', 0).mockReturnValue('myhash');
				thisArg.getNodeParameter.calledWith('fields', 0).mockReturnValue('field1 nonexistent field3');
				thisArg.getNodeParameter.calledWith('propertyName', 0).mockReturnValue('result');
				mockClient.hmGet.mockResolvedValue(['value1', null, 'value3']);

				const output = await node.execute.call(thisArg);
				
				expect(mockClient.hmGet).toHaveBeenCalledWith('myhash', ['field1', 'nonexistent', 'field3']);
				expect(output[0][0].json).toEqual({
					x: 1,
					result: {
						field1: 'value1',
						nonexistent: null,
						field3: 'value3'
					}
				});
			});
		});

		describe('zrem operation', () => {
			it('should remove members by name (default)', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('zrem');
				thisArg.getNodeParameter.calledWith('sortedSet', 0).mockReturnValue('myzset');
				thisArg.getNodeParameter.calledWith('removeBy', 0).mockReturnValue('members');
				thisArg.getNodeParameter.calledWith('members', 0).mockReturnValue('member1 member2');
				mockClient.zRem.mockResolvedValue(2);

				const output = await node.execute.call(thisArg);

				expect(mockClient.zRem).toHaveBeenCalledWith('myzset', ['member1', 'member2']);
				expect(output[0][0].json).toEqual({
					sortedSet: 'myzset',
					removed: 2,
					members: ['member1', 'member2']
				});
			});

			it('should remove by score range', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('zrem');
				thisArg.getNodeParameter.calledWith('sortedSet', 0).mockReturnValue('myzset');
				thisArg.getNodeParameter.calledWith('removeBy', 0).mockReturnValue('score');
				thisArg.getNodeParameter.calledWith('minScore', 0).mockReturnValue('0');
				thisArg.getNodeParameter.calledWith('maxScore', 0).mockReturnValue('100');
				mockClient.zRemRangeByScore.mockResolvedValue(5);

				const output = await node.execute.call(thisArg);

				expect(mockClient.zRemRangeByScore).toHaveBeenCalledWith('myzset', '0', '100');
				expect(output[0][0].json).toEqual({
					sortedSet: 'myzset',
					removed: 5,
					minScore: '0',
					maxScore: '100'
				});
			});

			it('should remove by score range with infinity', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('zrem');
				thisArg.getNodeParameter.calledWith('sortedSet', 0).mockReturnValue('myzset');
				thisArg.getNodeParameter.calledWith('removeBy', 0).mockReturnValue('score');
				thisArg.getNodeParameter.calledWith('minScore', 0).mockReturnValue('-inf');
				thisArg.getNodeParameter.calledWith('maxScore', 0).mockReturnValue('+inf');
				mockClient.zRemRangeByScore.mockResolvedValue(10);

				const output = await node.execute.call(thisArg);

				expect(mockClient.zRemRangeByScore).toHaveBeenCalledWith('myzset', '-inf', '+inf');
				expect(output[0][0].json).toEqual({
					sortedSet: 'myzset',
					removed: 10,
					minScore: '-inf',
					maxScore: '+inf'
				});
			});

			it('should remove by rank range', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('zrem');
				thisArg.getNodeParameter.calledWith('sortedSet', 0).mockReturnValue('myzset');
				thisArg.getNodeParameter.calledWith('removeBy', 0).mockReturnValue('rank');
				thisArg.getNodeParameter.calledWith('start', 0).mockReturnValue(0);
				thisArg.getNodeParameter.calledWith('stop', 0).mockReturnValue(9);
				mockClient.zRemRangeByRank.mockResolvedValue(10);

				const output = await node.execute.call(thisArg);

				expect(mockClient.zRemRangeByRank).toHaveBeenCalledWith('myzset', 0, 9);
				expect(output[0][0].json).toEqual({
					sortedSet: 'myzset',
					removed: 10,
					start: 0,
					stop: 9
				});
			});

			it('should remove by rank range with negative indices', async () => {
				thisArg.getInputData.mockReturnValue([{ json: { x: 1 } }]);
				thisArg.getNodeParameter.calledWith('operation', 0).mockReturnValue('zrem');
				thisArg.getNodeParameter.calledWith('sortedSet', 0).mockReturnValue('myzset');
				thisArg.getNodeParameter.calledWith('removeBy', 0).mockReturnValue('rank');
				thisArg.getNodeParameter.calledWith('start', 0).mockReturnValue(-10);
				thisArg.getNodeParameter.calledWith('stop', 0).mockReturnValue(-1);
				mockClient.zRemRangeByRank.mockResolvedValue(10);

				const output = await node.execute.call(thisArg);

				expect(mockClient.zRemRangeByRank).toHaveBeenCalledWith('myzset', -10, -1);
				expect(output[0][0].json).toEqual({
					sortedSet: 'myzset',
					removed: 10,
					start: -10,
					stop: -1
				});
			});
		});

		// Additional operation tests would continue here...
		// This provides the comprehensive pattern for testing all 44 operations
	});
});
