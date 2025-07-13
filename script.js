document.addEventListener("DOMContentLoaded", () => {
  const ramos = document.querySelectorAll(".ramo");
  const temaSelector = document.getElementById("tema");

  // Establecer tema por defecto
  document.body.classList.add("tema-verde");

  // Inicializar ramos bloqueados si tienen prerrequisitos
  ramos.forEach(ramo => {
    const prereqs = ramo.dataset.prerrequisitos;
    if (prereqs && prereqs.trim() !== "") {
      ramo.classList.add("bloqueado");
    }
  });

  // Cambiar color de tema
  temaSelector.addEventListener("change", e => {
    document.body.classList.remove("tema-verde", "tema-rosado", "tema-azul");
    document.body.classList.add(`tema-${e.target.value}`);
  });

  // Lógica de clic: aprobar ramo y desbloquear los dependientes
  ramos.forEach(ramo => {
    ramo.addEventListener("click", () => {
      if (ramo.classList.contains("bloqueado")) return;

      ramo.classList.add("aprobado");
      ramo.classList.remove("bloqueado");

      const id = ramo.id;

      // Revisar qué ramos dependen de este
      ramos.forEach(posible => {
        if (posible.classList.contains("bloqueado")) {
          const prereqs = posible.dataset.prerrequisitos.split(",");
          const todosAprobados = prereqs.every(pr =>
            document.getElementById(pr)?.classList.contains("aprobado")
          );

          if (todosAprobados) {
            posible.classList.remove("bloqueado");
          }
        }
      });
    });
  });
});
