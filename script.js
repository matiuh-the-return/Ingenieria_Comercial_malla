
document.addEventListener("DOMContentLoaded", () => {
  const ramos = document.querySelectorAll(".ramo");
  const temaSelector = document.getElementById("tema");

  // Establecer tema por defecto
  document.body.classList.add("tema-verde");

  // Marcar ramos que tienen prerrequisitos como bloqueados
  ramos.forEach(ramo => {
    const prereqs = ramo.dataset.prerrequisitos;
    if (prereqs && prereqs !== "") {
      ramo.classList.add("bloqueado");
    }
  });

  // Cambiar tema
  temaSelector.addEventListener("change", (e) => {
    document.body.classList.remove("tema-verde", "tema-rosado", "tema-azul");
    document.body.classList.add(`tema-${e.target.value}`);
  });

  // Al hacer clic en un ramo
  ramos.forEach(ramo => {
    ramo.addEventListener("click", () => {
      if (ramo.classList.contains("bloqueado")) return;

      ramo.classList.add("aprobado");
      ramo.classList.remove("bloqueado");

      // Desbloquear ramos que dependan de este
      const id = ramo.id;

      ramos.forEach(r => {
        if (r.classList.contains("bloqueado")) {
          const prereqs = r.dataset.prerrequisitos.split(",");
          const todosAprobados = prereqs.every(pr =>
            document.getElementById(pr)?.classList.contains("aprobado")
          );
          if (todosAprobados) {
            r.classList.remove("bloqueado");
          }
        }
      });
    });
  });
});
