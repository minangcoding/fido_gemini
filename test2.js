const apiKey = process.env.GEMINI_API_KEY;

async function test() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: "Test" }]
      }]
    })
  });
  console.log("gemini-2.5-flash response:", res.status);
  
  const res2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: "Test" }]
      }]
    })
  });
  console.log("gemini-2.5-flash-image-preview response:", res2.status, await res2.text());
}
test();
