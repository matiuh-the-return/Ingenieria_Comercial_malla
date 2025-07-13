document.querySelectorAll('.ramo').forEach(ramo => {
  ramo.addEventListener('click', () => {
    if (ramo.classList.contains('bloqueado')) return;

    ramo.classList.add('aprobado');

    const id = ramo.dataset.id;
    const abre = ramo.dataset.abre?.split(',') || [];

    abre.forEach(destinoId => {
      const destino = document.querySelector(`.ramo[data-id="${destinoId}"]`);
      if (destino && destino.classList.contains('bloqueado')) {
        // Verifica si todos los prerrequisitos de destino están aprobados
        const requisitos = Array.from(document.querySelectorAll(`.ramo[data-abre*="${destinoId}"]`));
        const todosAprobados = requisitos.every(r => r.classList.contains('aprobado'));

        if (todosAprobados) {
          destino.classList.remove('bloqueado');
        }
      }
    });
  });
});
