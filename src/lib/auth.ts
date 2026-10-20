// Stand-in for the sign-in API until there is a backend. Requests fail while
// the browser is offline. Instead of emailing the code, sendLoginCode logs it
// to the browser console, and only the latest code sent to an address is
// accepted. Replace these functions with calls to the real API.

const pendingCodes = new Map<string, string>()

export class InvalidCodeError extends Error {
  constructor() {
    super("That code is incorrect or has expired.")
    this.name = "InvalidCodeError"
  }
}

async function simulateRequest() {
  await new Promise((resolve) => setTimeout(resolve, 600))
  if (!navigator.onLine) {
    throw new Error("Network request failed")
  }
}

function generateCode() {
  const [value] = crypto.getRandomValues(new Uint32Array(1))
  return String(value % 1_000_000).padStart(6, "0")
}

export async function sendLoginCode(email: string) {
  await simulateRequest()
  const code = generateCode()
  pendingCodes.set(email, code)
  console.info(`Login code for ${email}: ${code}`)
}

export async function verifyLoginCode(email: string, code: string) {
  await simulateRequest()
  if (pendingCodes.get(email) !== code) {
    throw new InvalidCodeError()
  }
  pendingCodes.delete(email)
}
