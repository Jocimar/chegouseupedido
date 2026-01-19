
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getProductHighlight(title: string, description: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise este produto e resuma em uma única frase curta e chamativa (máximo 12 palavras) por que ele é uma boa compra hoje.
      Título: ${title}
      Descrição: ${description}`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text?.trim() || "Oferta selecionada a dedo!";
  } catch (error) {
    return "O melhor preço do mercado agora!";
  }
}

export async function parseTelegramContent(content: string): Promise<any[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um robô caçador de ofertas. Analise o seguinte lote de mensagens vindas de um canal de promoções:
      
      "${content}"
      
      Ignore mensagens que não sejam ofertas de produtos. Para cada oferta válida, extraia:
      - title: Nome claro do produto
      - price: Valor numérico atual (apenas números)
      - originalPrice: Valor sem desconto (se houver)
      - description: Resumo rápido
      - imageUrl: URL da imagem se houver link de mídia, senão uma URL do picsum relacionada ao produto
      - affiliateUrl: O link de compra/afiliado
      - categorySlug: (eletronicos, smartphone, casa, moda, beleza, games)
      - storeId: (s1=Amazon, s2=MercadoLivre, s3=Shopee, s4=Magalu) identificada pelo link.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              price: { type: Type.NUMBER },
              originalPrice: { type: Type.NUMBER },
              description: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              affiliateUrl: { type: Type.STRING },
              categorySlug: { type: Type.STRING },
              storeId: { type: Type.STRING },
            },
            required: ["title", "price", "affiliateUrl", "categorySlug", "storeId"],
          }
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini parsing error:", error);
    return [];
  }
}

export async function extractProductInfoFromUrl(url: string): Promise<any> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise este link de produto e retorne os dados estruturados em JSON.
      Link: ${url}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            price: { type: Type.NUMBER },
            originalPrice: { type: Type.NUMBER },
            description: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            categorySlug: { type: Type.STRING },
            storeId: { type: Type.STRING },
          },
          required: ["title", "price", "imageUrl", "categorySlug", "storeId"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return null;
  }
}
