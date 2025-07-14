const ramos = document.querySelectorAll('.ramo');

// Leer progreso guardado
const progreso = JSON.parse(localStorage.getItem('ramosAprobados') || '[]');

// Aplicar progreso guardado
progreso.forEach(id => {
  const ramo = document.querySelector(`.ramo[data-id="${id}"]`);
  if (ramo) {
    aprobarRamo(ramo, false);
  }
});

// Lógica al hacer clic
ramos.forEach(ramo => {
  ramo.addEventListener('click', () => {
    if (ramo.classList.contains('bloqueado')) return;

    if (ramo.classList.contains('aprobado')) {
      desaprobarRamo(ramo);
    } else {
      aprobarRamo(ramo, true);
    }

    guardarProgreso();
  });
});

function aprobarRamo(ramo, desbloquearDependientes = true) {
  ramo.classList.add('aprobado');

  if (!desbloquearDependientes) return;

  const abre = ramo.dataset.abre?.split(',') || [];
  abre.forEach(destinoId => {
    const destino = document.querySelector(`.ramo[data-id="${destinoId}"]`);
    if (destino && destino.classList.contains('bloqueado')) {
      const prerequisitos = Array.from(document.querySelectorAll(`.ramo[data-abre*="${destinoId}"]`));
      const todosAprobados = prerequisitos.every(r => r.classList.contains('aprobado'));
      if (todosAprobados) {
        destino.classList.remove('bloqueado');
      }
    }
  });
}

function desaprobarRamo(ramo) {
  ramo.classList.remove('aprobado');

  // Buscar todos los ramos que dependen de este
  const id = ramo.dataset.id;
  const dependientes = Array.from(document.querySelectorAll(`.ramo[data-abre*="${id}"]`));

  dependientes.forEach(destino => {
    // Revisar si alguno de sus prerrequisitos ya no está aprobado
    const requisitos = Array.from(document.querySelectorAll(`.ramo[data-abre*="${destino.dataset.id}"]`));
    const todosAprobados = requisitos.every(r => r.classList.contains('aprobado'));
    if (!todosAprobados) {
      destino.classList.add('bloqueado');
      destino.classList.remove('aprobado');
      // Desbloquea recursivamente los que dependan de este también
      desaprobarRamo(destino);
    }
  });
}

function guardarProgreso() {
  const aprobados = Array.from(document.querySelectorAll('.ramo.aprobado')).map(r => r.dataset.id);
  localStorage.setItem('ramosAprobados', JSON.stringify(aprobados));
}
