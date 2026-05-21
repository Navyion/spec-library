export default async function handler(request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const apiUrl =
    "https://www.data4library.kr/api/srchBooks" +
    "?authKey=" + searchParams.get("authKey") +
    "&title=" + encodeURIComponent(searchParams.get("title") || "") +
    "&format=json" +
    "&pageSize=" + (searchParams.get("pageSize") || "10");

  try {
    const response = await fetch(apiUrl);
    const data = await response.text();

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ response: { error: "API 서버 연결 실패" } }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export const config = {
  path: "/api/*",
};