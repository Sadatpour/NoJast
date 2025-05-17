// پنهان کردن هشدارها و خطاهای کنسول فقط در production
if (typeof window !== "undefined") {
  if (process.env.NODE_ENV === "production") {
    window.console.warn = () => {};
    window.console.error = () => {};
  }
} 