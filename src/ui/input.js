export function disableInput() {
  const input = document.getElementById("nameInput");
  if (!input) {
    console.error("❌ No se encontró el elemento con id 'nameInput'");
    const alternativeInput =
      document.querySelector('input[type="text"]') ||
      document.querySelector("input") ||
      document.querySelector("#chat-input");
    if (alternativeInput) {
      alternativeInput.disabled = true;
      alternativeInput.placeholder = "Selecciona una opción para continuar...";
      return;
    }
    return;
  }
  input.disabled = true;
  input.placeholder = "Selecciona una opción para continuar...";
}

export function enableInput() {
  const input = document.getElementById("nameInput");
  if (!input) {
    console.error("❌ No se encontró el elemento con id 'nameInput'");
    const alternativeInput =
      document.querySelector('input[type="text"]') ||
      document.querySelector("input") ||
      document.querySelector("#chat-input");
    if (alternativeInput) {
      alternativeInput.disabled = false;
      alternativeInput.placeholder = "Escribe tu respuesta...";
      return;
    }
    return;
  }
  input.disabled = false;
  input.placeholder = "Escribe tu respuesta...";
}
