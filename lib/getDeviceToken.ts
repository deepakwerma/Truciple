export function getDeviceToken(): string {
  if (typeof window === "undefined") return "";

  const key = "device_token";
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}