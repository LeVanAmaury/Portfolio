import fs from 'fs';

// Lecture manuelle de la clé dans .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

async function listModels() {
  if (!apiKey) {
    console.error("❌ Pas de clé API trouvée dans .env.local");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log("🔍 Interrogation de Google AI Studio...");

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Erreur de l'API :", data.error);
    } else if (data.models) {
      console.log("✅ Modèles disponibles pour votre clé :");
      data.models.forEach(m => {
        console.log(`- ${m.name}`);
      });
    } else {
      console.log("⚠️ Réponse inattendue :", data);
    }
  } catch (error) {
    console.error("❌ Erreur de connexion :", error.message);
  }
}

listModels();
