const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://port-0-dongnea-mhfzs5l502d0035e.sel3.cloudtype.app";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return Response.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const incomingFormData = await request.formData();
  const clubId = incomingFormData.get("clubId");
  const file = incomingFormData.get("file");
  const type = incomingFormData.get("type");

  if (!clubId || !file || !type) {
    return Response.json(
      { message: "clubId, file, type은 필수입니다." },
      { status: 400 }
    );
  }

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("type", type);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/clubs/${clubId}/images`, {
      method: "POST",
      redirect: "manual",
      headers: {
        Authorization: authorization,
      },
      body: uploadFormData,
    });
  } catch (error) {
    console.error("Backend image upload request failed:", error);
    return Response.json(
      { message: "이미지 업로드 서버에 연결하지 못했습니다." },
      { status: 502 }
    );
  }

  if (response.status >= 300 && response.status < 400) {
    return Response.json(
      { message: "로그인이 만료되었습니다. 다시 로그인해주세요." },
      { status: 401 }
    );
  }

  const contentType = response.headers.get("content-type");
  const body = contentType?.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  return Response.json(body, { status: response.status });
}
