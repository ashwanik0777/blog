async function run() {
  const res = await fetch("http://localhost:3000/api/ai/generate-blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": "admin_session=true"
    },
    body: JSON.stringify({ title: "Test", keywords: "test" })
  });
  const text = await res.text();
  console.log(res.status);
  console.log(text);
}
run();
