import fs from 'fs';

const envItem = fs.readFileSync('.env', 'utf8').split('\n').find(l => l.startsWith('PIPEFY_API_TOKEN='));
const token = envItem ? envItem.split('=')[1].trim() : '';

const query = `
{ 
  allCards(pipeId: 306842929, first: 1) { 
    edges { 
      node { 
        title
        fields { 
          name 
          value 
        } 
      } 
    } 
  } 
}
`;

fetch('https://api.pipefy.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ query })
})
.then(r => r.json())
.then(data => {
  if (!data?.data?.allCards) console.error("Error Pipefy:", data);
  const card = data.data.allCards.edges[0].node;
  console.log(JSON.stringify(card.fields, null, 2));
})
.catch(console.error);
