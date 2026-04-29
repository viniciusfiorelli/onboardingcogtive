import dotenv from 'dotenv';
dotenv.config();

const pipefyToken = process.env.PIPEFY_API_TOKEN;
const pipeId = process.env.PIPEFY_PIPE_ID || "306842929";

async function run() {
  const query = `
    {
      card(id: "782017042") {
        title
        fields {
          name value
          field { label }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.pipefy.com/graphql", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${pipefyToken}` 
      },
      body: JSON.stringify({ query })
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

run();
