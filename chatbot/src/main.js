import { showInitialOptions } from "./handlers/initialOptions.js";
import { processUserInput, initializeChat } from "./handlers/processAnswer.js";
import { disableInput, enableInput } from "./ui/input.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Primero cargar las preguntas
    await initializeChat();
    
    // Después mostrar las opciones iniciales
    showInitialOptions();
    
    console.log("Aplicación inicializada correctamente");
  } catch (error) {
    console.error("Error inicializando la aplicación:", error);
    // Mostrar mensaje de error al usuario
    document.body.innerHTML = '<p>Error cargando la aplicación. Por favor recarga la página.</p>';
  }
});

document.getElementById("nameInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendInput();
});
document.querySelector(".send-button").addEventListener("click", sendInput);

function sendInput() {
  const input = document.getElementById("nameInput");
  const text = input.value.trim();
  if (!text) return;

  processUserInput(text);
  input.value = "";
}