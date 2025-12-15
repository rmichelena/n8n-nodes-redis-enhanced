# n8n-nodes-redis-enhanced

This is an n8n community node that provides comprehensive Redis integration with enhanced operations for your n8n workflows.

Redis Enhanced extends the basic Redis functionality with 44+ operations including atomic operations, bulk operations, advanced data structures (sets, sorted sets, hashes), TTL management, Lua scripting, and pub/sub capabilities.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Development](#development)  
[Testing](#testing)  
[Resources](#resources)  
[Version History](#version-history)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Quick Install
1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Enter the package name: `@rmichelena/n8n-nodes-redis-enhanced`
4. Click **Install**
5. Restart n8n

### Manual Installation
```bash
npm install @rmichelena/n8n-nodes-redis-enhanced
```

## Operations

Redis Enhanced provides 44 comprehensive operations organized by category:

### 🔑 **Basic Operations**
- **Get** - Retrieve values from Redis with automatic type detection
- **Set** - Store values with atomic lock support (NX/XX modes) and TTL
- **Delete** - Remove single or multiple keys from Redis (supports bulk deletion)
- **Exists** - Check if one or more keys exist
- **Info** - Get Redis server information and statistics

### 📦 **Bulk Operations**

#### **Native Redis Operations**
- **Multi Get (MGET)** - Retrieve multiple string keys in a single atomic operation (Redis native)
- **Multi Set (MSET)** - Set multiple string key-value pairs atomically (Redis native)

#### **Enhanced Mixed-Type Operations**
- **Multi Mix Get (MXGET)** - Retrieve multiple keys with automatic type detection (string, hash, list, set)
  - *Note: Custom implementation that iterates over keys using individual GET operations*
- **Multi Mix Set (MXSET)** - Set multiple keys with automatic type detection and JSON parsing
  - *Note: Custom implementation that iterates over keys using individual SET operations*

#### **Key Discovery Operations**  
- **Scan** - Production-safe key iteration with pattern matching
- **Keys** - Find keys matching patterns (with optional value retrieval)

### 🔢 **String Operations**
- **Increment (INCR)** - Atomic counter operations with optional TTL
- **Append** - Append values to existing strings
- **String Length** - Get the length of string values
- **Get Set** - Atomically set new value and return old value

### 📋 **List Operations**
- **Push** - Add elements to lists (left/right)
- **Pop** - Remove elements from lists (left/right)
- **Blocking Pop Left (BLPOP)** - Blocking pop from list start
- **Blocking Pop Right (BRPOP)** - Blocking pop from list end
- **List Length** - Get the number of elements in a list
- **List Range (LRANGE)** - Get a range of elements from a list
- **List Set (LSET)** - Set the value of an element in a list by index
- **List Trim (LTRIM)** - Trim a list to the specified range
- **List Remove (LREM)** - Remove elements from a list by value

### 🎯 **Set Operations**
- **Set Add (SADD)** - Add members to sets
- **Set Remove (SREM)** - Remove members from sets
- **Set Is Member (SISMEMBER)** - Check set membership
- **Set Cardinality (SCARD)** - Get the number of set members

### 📊 **Sorted Set Operations**
- **Sorted Set Add (ZADD)** - Add scored members to sorted sets
- **Sorted Set Range (ZRANGE)** - Get ranges with optional scores
- **Sorted Set Remove (ZREM)** - Remove members by name, score range, or rank range
- **Sorted Set Cardinality (ZCARD)** - Get sorted set size

### 🗂️ **Hash Operations**
- **Hash Set (HSET)** - Set the value of a hash field
- **Hash Get (HGET)** - Get the value of a hash field
- **Multi Hash Get (HMGET)** - Get multiple hash field values at once
- **Hash Length (HLEN)** - Get number of hash fields
- **Hash Keys (HKEYS)** - Get all field names
- **Hash Values (HVALS)** - Get all hash values
- **Hash Exists (HEXISTS)** - Check if hash field exists

### ⏰ **TTL Operations**
- **TTL** - Get time-to-live for keys
- **Persist** - Remove expiration from keys
- **Expire At** - Set expiration at specific timestamp

### 🚀 **Advanced Operations**
- **Eval** - Execute Lua scripts with key/argument support
- **Publish** - Publish messages to Redis channels

### 🔒 **Enhanced Features**
- **Atomic Operations** - NX (set if not exists) and XX (set if exists) modes
- **Bulk Processing** - Space-separated input parsing for multiple keys/values
- **Type Safety** - Automatic type detection and conversion
- **Error Handling** - Comprehensive error handling with continue-on-fail support
- **Production Ready** - Optimized for high-performance production use

## Credentials

To use Redis Enhanced, you need to set up Redis credentials in n8n:

### Prerequisites
- A Redis server (local, cloud, or managed service like AWS ElastiCache, Redis Cloud, etc.)
- Network connectivity from n8n to your Redis instance

### Authentication Setup
1. In n8n, go to **Credentials** → **Create New**
2. Search for **Redis Enhanced**
3. Configure the connection:
   - **Host**: Your Redis server hostname or IP
   - **Port**: Redis port (default: 6379)
   - **Database**: Database number (default: 0)
   - **Password**: Redis password (if AUTH is enabled)
   - **User**: Redis username (for Redis 6+ ACL)
   - **SSL**: Enable for TLS connections

### Supported Authentication Methods
- **No Authentication** - For development/local Redis instances
- **Password Authentication** - Traditional Redis AUTH
- **Username/Password** - Redis 6+ ACL with user accounts
- **TLS/SSL** - Encrypted connections for production deployments

## Compatibility

- **Minimum n8n version**: 1.0.0+
- **Redis versions**: 3.0+ (tested up to Redis 7.x)
- **Node.js**: 20.15+
- **Tested with**: n8n 1.x, Redis 6.x, Redis 7.x

### Known Compatibility
- ✅ **n8n Cloud**: Fully compatible
- ✅ **Self-hosted n8n**: All versions 1.0+
- ✅ **Docker deployments**: Tested and verified
- ✅ **Redis Cloud**: Compatible with all major providers
- ✅ **AWS ElastiCache**: Full compatibility
- ✅ **Redis Sentinel**: Supported
- ✅ **Redis Cluster**: Basic operations supported

## Usage

### Basic Example: Caching API Responses
```yaml
# Workflow: Cache expensive API calls
1. HTTP Request (API call)
2. Redis Enhanced (SET with TTL)
   - Operation: Set
   - Key: api:cache:{{$json.id}}
   - Value: {{$json}}
   - TTL: 300 seconds
```

### Advanced Example: Atomic Counters
```yaml
# Workflow: Rate limiting with atomic counters
1. Redis Enhanced (SET with NX)
   - Operation: Set
   - Key: rate_limit:{{$json.user_id}}
   - Value: 1
   - Set Mode: Set If Not Exists (NX)
   - TTL: 3600 seconds
2. If key already exists → Rate limit exceeded
```

### Bulk Operations Example

#### Native Redis Bulk Operations (Atomic)
```yaml
# Workflow: Bulk string data processing (Redis native - atomic)
1. Redis Enhanced (MGET)
   - Operation: Multi Get
   - Keys: counter:1 counter:2 counter:3
   # Native Redis MGET - atomic operation for string values only

2. Redis Enhanced (MSET) 
   - Operation: Multi Set
   - Key-Value Pairs: updated:1 true updated:2 true
   # Native Redis MSET - atomic operation for string values only
```

#### Mixed-Type Bulk Operations (Enhanced)
```yaml
# Workflow: Mixed data type processing (Custom implementation)
1. Redis Enhanced (MXGET)
   - Operation: Multi Mix Get
   - Keys: user:profile:123 notifications:list:123 stats:hash:123
   # Custom implementation - iterates over keys with type detection
   # Supports string, hash, list, and set data types

2. Redis Enhanced (MXSET)
   - Operation: Multi Mix Set  
   - Key-Value Pairs: user:name "John" config:data {"theme":"dark"} tags:list ["redis","n8n"]
   # Custom implementation - iterates over keys with JSON parsing
   # Automatically detects and sets appropriate Redis data types
```

### List Range Example
```yaml
# Workflow: Paginated list retrieval
1. Redis Enhanced (LRANGE)
   - Operation: List Range
   - List: notifications:user:123
   - Start Index: 0
   - Stop Index: 9
   # Returns first 10 elements (pagination)
```

### Bulk Deletion Example
```yaml
# Workflow: Clean up session keys
1. Redis Enhanced (DELETE)
   - Operation: Delete
   - Key(s): session:123 session:456 temp:abc cache:xyz
   # Deletes multiple keys in a single operation
   # Returns: { deletedKeys: ["session:123", ...], deletedCount: 3 }
```

### Hash Operations Example
```yaml
# Workflow: User profile management with hashes
1. Redis Enhanced (HSET)
   - Operation: Hash Set
   - Hash: user:profile:123
   - Field: email
   - Value: user@example.com
   # Sets a single field in a hash

2. Redis Enhanced (HGET)
   - Operation: Hash Get
   - Hash: user:profile:123
   - Field: email
   - Property Name: userEmail
   # Gets a single field value

3. Redis Enhanced (HMGET)
   - Operation: Multi Hash Get
   - Hash: user:profile:123
   - Fields: email name age city
   - Property Name: profileData
   # Returns: { email: "user@example.com", name: "John", age: "30", city: "NYC" }
```

### List Manipulation Example
```yaml
# Workflow: Managing notification queues with advanced list operations
1. Redis Enhanced (LSET)
   - Operation: List Set
   - List: notifications:user:123
   - Index: 2
   - Value: {"message": "Updated notification", "read": true}
   # Updates a specific element in the list by index

2. Redis Enhanced (LTRIM)
   - Operation: List Trim
   - List: notifications:user:123
   - Start: 0
   - Stop: 99
   # Keeps only the first 100 elements (removes older notifications)

3. Redis Enhanced (LREM)
   - Operation: List Remove
   - List: notifications:user:123
   - Count: 0
   - Value: {"type": "spam"}
   # Removes all elements matching the value (count=0 removes all)
```

### Sorted Set Range Removal Example
```yaml
# Workflow: Managing leaderboards and time-series data with sorted sets
1. Redis Enhanced (ZREM - Remove by Score Range)
   - Operation: Sorted Set Remove
   - Sorted Set: leaderboard:game:123
   - Remove By: Score Range
   - Min Score: 0
   - Max Score: 100
   # Removes all players with scores between 0-100

2. Redis Enhanced (ZREM - Remove by Rank Range)
   - Operation: Sorted Set Remove
   - Sorted Set: events:recent
   - Remove By: Rank Range
   - Start Index: 0
   - Stop Index: 99
   # Keeps only top 100 events, removes the rest

3. Redis Enhanced (ZREM - Remove by Members)
   - Operation: Sorted Set Remove
   - Sorted Set: active:users
   - Remove By: Members
   - Members: user:123 user:456 user:789
   # Removes specific members by name
```

### Production Tips

#### **Bulk Operations Strategy**
- **Use MGET/MSET for strings**: Native Redis operations are atomic and faster for string-only data
- **Use MXGET/MXSET for mixed types**: When you need automatic type detection for hashes, lists, sets
- **Performance consideration**: MXGET/MXSET iterate over keys (non-atomic) vs MGET/MSET (atomic)
- **Choose based on data type**: Strings → native operations, Mixed types → enhanced operations

#### **General Best Practices**
- Use **SCAN** instead of **KEYS** for production key iteration
- Leverage **atomic operations** (NX/XX) for race condition prevention
- Set appropriate **TTL values** for cache invalidation
- Monitor operations with **INFO** for production insights
- Consider **network round trips**: MGET/MSET = 1 trip, MXGET/MXSET = N trips (where N = number of keys)

## Development

### Prerequisites
- Node.js 20.15+
- npm or yarn
- Redis server for testing

### Setup
```bash
git clone https://github.com/vicenterusso/n8n-nodes-redis-enhanced.git
cd n8n-nodes-redis-enhanced
npm install
```

### Build
```bash
npm run build     # Build the node
npm run dev       # Build in watch mode
npm run lint      # Check code quality
npm run lintfix   # Auto-fix linting issues
```

## Testing

The project includes comprehensive test coverage with 60+ tests covering all operations:

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode  
npm run test:coverage # Run with coverage report
```

### Test Coverage
- **60 passing tests** across all operations
- **42.97% code coverage** with detailed branch coverage
- **Infrastructure testing** (connection, client setup)
- **Operation testing** (all 44 operations)
- **Error handling** (continue-on-fail scenarios)
- **Parameter validation** (input validation)

### Test Categories
- ✅ **Connection Tests** - Redis client setup and connectivity
- ✅ **Basic Operations** - GET, SET, DELETE, EXISTS, INFO
- ✅ **Bulk Operations** - MGET, MSET, SCAN, KEYS
- ✅ **Advanced Operations** - Atomic operations, TTL, Lua scripts
- ✅ **Error Handling** - Comprehensive error scenarios
- ✅ **Type Safety** - Input/output type validation

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Redis Documentation](https://redis.io/documentation)
- [Redis Commands Reference](https://redis.io/commands)
- [n8n Workflow Templates](https://n8n.io/workflows)
- [Project Repository](https://github.com/rmichelena/n8n-nodes-redis-enhanced)

## Version History

### v0.2.5 (Current)
- **List & Sorted Set Operations Enhancement** with 44 Redis operations
- **🆕 New LSET Operation** - Set the value of an element in a list by index
- **🆕 New LTRIM Operation** - Trim a list to the specified range for efficient queue management
- **🆕 New LREM Operation** - Remove elements from a list by value with flexible count options
- **✨ Enhanced ZREM Operation** - Now supports removal by members, score range (ZREMRANGEBYSCORE), or rank range (ZREMRANGEBYRANK)
- **🧪 Enhanced Testing** - 60 comprehensive tests covering all operations including new list and sorted set capabilities
- **📖 Updated Documentation** - Complete list manipulation and sorted set range removal examples
- **🔧 Production Ready** - Advanced list management for queue processing and leaderboard cleanup

#### What's New in v0.2.5:
- ✅ **LSET Operation**: Update individual list elements by index (supports negative indices)
- ✅ **LTRIM Operation**: Trim lists to specific ranges for efficient memory management
- ✅ **LREM Operation**: Remove elements by value with count control (remove first N, last N, or all)
- ✅ **ZREM Enhancement**: Remove by members (default), score range (-inf to +inf), or rank range (0-based indices)
- ✅ **Enhanced Testing**: 60 tests with comprehensive coverage including sorted set range operations
- ✅ **Better Documentation**: Practical examples for leaderboards, notification queues, and time-series data cleanup

### v0.2.4
- **Documentation Enhancement** - Clear distinction between native and custom operations
- **🆕 Enhanced MXGET/MXSET Documentation** - Detailed explanation of custom mixed-type operations
- **📖 Updated Examples** - Separate examples for native vs custom bulk operations
- **🎯 Production Guidelines** - Performance considerations and best practices for bulk operations
- **🔧 Technical Clarity** - Clear explanation of atomic vs non-atomic operations

#### What's New in v0.2.4:
- ✅ **Clear Operation Types**: Native Redis operations (MGET/MSET) vs Custom implementations (MXGET/MXSET)
- ✅ **Performance Guidance**: When to use atomic operations vs type-detection operations
- ✅ **Enhanced Examples**: Practical usage examples for both operation types
- ✅ **Technical Documentation**: Network round-trip considerations and performance impact

### v0.2.3
- **Hash Operations Release** with 41 Redis operations
- **🆕 New Hash Operations** - HSET, HGET, HMGET for granular hash field management
- **🧪 Enhanced Testing** - 48 tests with comprehensive hash operation coverage
- **📖 Updated Documentation** - Complete hash operations examples and usage guides
- **🔧 Production Ready** - Atomic hash field operations with JSON support

#### What's New in v0.2.3:
- ✅ **HSET Operation**: Set individual hash field values with optional JSON parsing
- ✅ **HGET Operation**: Get individual hash field values with automatic JSON detection
- ✅ **HMGET Operation**: Get multiple hash field values in a single operation
- ✅ **Enhanced Testing**: 48 comprehensive tests covering all operations including new hash ops
- ✅ **Better Documentation**: Updated examples and use cases for hash operations

### v0.2.0
- **Enhanced Release** with 36 Redis operations
- **🆕 New LRANGE Operation** - Read ranges of elements from Redis lists
- **🚀 Enhanced DELETE Operation** - Multiple key deletion support with detailed response
- **🐛 Fixed MGET Mixed Types** - MGET now supports hash, list, set data types (not just strings)
- **🧪 Comprehensive Testing** - 39 tests, improved coverage
- **📖 Updated Documentation** - Complete API coverage with new examples
- **🔧 Production Ready** - Atomic operations, bulk processing, robust error handling

#### What's New in v0.2.0:
- ✅ **LRANGE Operation**: Get ranges of elements from lists with start/stop indices
- ✅ **MGET Type Detection**: Automatic type detection for mixed data types (string/hash/list/set)
- ✅ **Enhanced Testing**: 36 comprehensive tests covering all operations
- ✅ **Better Documentation**: Updated examples and use cases

#### Bug Fixes:
- Fixed MGET returning null for hash keys - now properly retrieves hash data
- Improved error handling for individual key failures in MGET operations

### v0.1.6 (Previous)
- **Initial Release** with 35 Redis operations  
- **Basic Testing** - 33 tests, foundational coverage
- **Production Ready** - Atomic operations, bulk processing, error handling
- **Enhanced Features** - NX/XX modes, TTL management, Lua scripting
- **Full Documentation** - Complete API coverage and examples

#### Features Added:
- ✅ Basic operations (GET, SET, DELETE, EXISTS, INFO)
- ✅ Bulk operations (MGET, MSET, SCAN, KEYS)  
- ✅ String operations (INCR, APPEND, STRLEN, GETSET)
- ✅ List operations (PUSH, POP, BLPOP, BRPOP, LLEN, LRANGE)
- ✅ Set operations (SADD, SREM, SISMEMBER, SCARD)
- ✅ Sorted set operations (ZADD, ZRANGE, ZREM, ZCARD)
- ✅ Hash operations (HSET, HGET, HMGET, HLEN, HKEYS, HVALS, HEXISTS)
- ✅ TTL operations (TTL, PERSIST, EXPIREAT)
- ✅ Advanced operations (EVAL, PUBLISH)
- ✅ Atomic lock support (NX/XX modes)
- ✅ Comprehensive error handling
- ✅ Production deployment tools

---

**Author**: Vicente Russo Neto (vicente.russo@gmail.com)  
**License**: MIT  
**Repository**: https://github.com/rmichelena/n8n-nodes-redis-enhanced
