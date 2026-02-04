function getToken() {
  const url = URL_LOGIN;
  const payload = PAYLOAD_LOGIN;
  const options = {
    method: "post",
    contentType: "application/json; charset=utf-8",
    headers: { "Accept": "application/json" },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const status = response.getResponseCode();
    const text = response.getContentText();

    if (status >= 200 && status < 300) {
      const data = JSON.parse(text);
      const token = data.token;
      if (!token) {
        return { ok: false, error: "Respuesta sin token", data };
      }
      PropertiesService.getScriptProperties().setProperty("IC_TOKEN", token);
      return token;
    } else {
      return { ok: false, status, error: text || "Error HTTP" };
    }
  } catch (e) {
    return { ok: false, error: e.toString() };
  }
}

function ensureToken(force = false) {
  let token = PropertiesService.getScriptProperties().getProperty("IC_TOKEN");
  
  // Si forzamos, o no hay token, o es inválido...
  if (force || !token || typeof token !== "string" || token.trim() === "") {
    console.log("Intentando obtener nuevo token..."); // Log de aviso
    
    const resultadoLogin = getToken(); // Aquí recibimos el string O el objeto de error

    if (typeof resultadoLogin === "string") {
      token = resultadoLogin;
    }
    else {
      console.error("FALLO EN LOGIN:", JSON.stringify(resultadoLogin)); // ¡Esto te dirá el error real!
      throw new Error("No se pudo obtener el token. Razón: " + (resultadoLogin.error || "Desconocida"));
    }
  }
  
  return token;
}

function fetchJSONWithAuth(url, token, options = {}) {
  const baseOpts = {
    method: options.method || "get",
    headers: Object.assign(
      {
        "Authorization": "Bearer " + token,
        "Accept": "application/json",
      },
      options.headers || {}
    ),
    muteHttpExceptions: true,
    payload: options.payload,
    contentType: options.contentType,
  };

  // 1er intento
  let res = UrlFetchApp.fetch(url, baseOpts);
  let status = res.getResponseCode();
  let text = res.getContentText();

  // Si token expiró, renovamos y reintentamos una vez
  if (status === 401 && /TOKEN_EXPIRED/i.test(text)) {
    token = ensureToken(true); // fuerza renovación
    const retryOpts = Object.assign({}, baseOpts, {
      headers: Object.assign({}, baseOpts.headers, { "Authorization": "Bearer " + token })
    });
    res = UrlFetchApp.fetch(url, retryOpts);
    status = res.getResponseCode();
    text = res.getContentText();
  }

  if (status < 200 || status >= 300) {
    throw new Error("Error HTTP " + status + ": " + text);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Respuesta no es JSON válido: " + e);
  }
}
