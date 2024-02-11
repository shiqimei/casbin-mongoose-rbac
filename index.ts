import * as casbin from 'casbin'
import { MongooseAdapter } from 'casbin-mongoose-adapter'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function main() {
  // Initialize Casbin adapter
  const MONGO_URI = process.env.MONGO_URI!
  const adapter = await MongooseAdapter.newAdapter(MONGO_URI)

  // Initialize enforcer
  const enforcer = await casbin.newEnforcer('model.conf', adapter)

  // Example policy additions
  await enforcer.addPolicy('alice', 'data1', 'read')
  await enforcer.addRoleForUser('bob', 'admin')

  // Tests with latency measurement
  const testCases = [
    { sub: 'alice', obj: 'data1', act: 'read', allowed: true },
    { sub: 'bob', obj: 'data2', act: 'write', allowed: true },
    { sub: 'bob', obj: 'data1', act: 'read', allowed: true }
  ]

  for (const testCase of testCases) {
    const startTime = Date.now()
    const result = await enforcer.enforce(testCase.sub, testCase.obj, testCase.act)
    const endTime = Date.now()
    const latency = endTime - startTime

    console.log(
      `${testCase.sub} ${testCase.act} ${testCase.obj} -> ${
        result === testCase.allowed ? 'PASS' : 'FAIL'
      } (Latency: ${latency}ms)`
    )
  }
}

main()
