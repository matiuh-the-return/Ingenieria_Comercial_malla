document.addEventListener('DOMContentLoaded', () => {
  const ramos = document.querySelectorAll('.ramo');

  // Leer progreso guardado
  let progreso = [];
  try {
    progreso = JSON.parse(localStorage.getItem('ramosAprobados')) || [];
  } catch (e) {
    console.error('Error al leer progreso:', e);
  }

  // Obtener prerrequisitos: quienes me tienen en su data-abre
  function getPrerequisitos(ramo) {
    const id = ramo.dataset.id;
    const prerequisitos = Array.from(ramos).filter(r => {
      const abre = r.dataset.abre?.split(',').map(s => s.trim()) || [];
      return abre.includes(id);
    }).map(r => r.dataset.id);
    return prerequisitos;
  }

  // Obtener ramos que dependen de un ramo dado
  function getDependientes(id) {
    return Array.from(ramos).filter(ramo => {
      const prereqs = getPrerequisitos(ramo);
      return prereqs.includes(id);
    });
  }

  // Validar estados iniciales de todos los ramos
  function validarEstadosIniciales() {
    ramos.forEach(ramo => {
      const prerequisitos = getPrerequisitos(ramo);
      const tienePrerrequisitos = prerequisitos.length > 0;

      if (tienePrerrequisitos) {
        const todosAprobados = prerequisitos.every(id => {
          const req = document.querySelector(`.ramo[data-id="${id}"]`);
          return req && req.classList.contains('aprobado');
        });
        ramo.classList.toggle('bloqueado', !todosAprobados);
      } else {
        ramo.classList.remove('bloqueado');
      }
    });
  }

  // Aplicar progreso guardado
  progreso.forEach(id => {
    const ramo = document.querySelector(`.ramo[data-id="${id}"]`);
    if (ramo) {
      ramo.classList.add('aprobado');
    }
  });

  // Validar estados luego de cargar progreso
  validarEstadosIniciales();

  // Manejo de clic en ramos
  ramos.forEach(ramo => {
    ramo.addEventListener('click', () => {
      if (ramo.classList.contains('bloqueado')) return;

      if (ramo.classList.contains('aprobado')) {
        desaprobarRamo(ramo);
      } else {
        aprobarRamo(ramo);
      }

      guardarProgreso();
    });
  });

  // Aprobar un ramo
  function aprobarRamo(ramo) {
    ramo.classList.add('aprobado');

    const id = ramo.dataset.id;
    const dependientes = getDependientes(id);

    dependientes.forEach(destino => {
      const prereqs = getPrerequisitos(destino);
      const todosAprobados = prereqs.every(reqId => {
        const req = document.querySelector(`.ramo[data-id="${reqId}"]`);
        return req && req.classList.contains('aprobado');
      });
      if (todosAprobados) {
        destino.classList.remove('bloqueado');
      }
    });
  }

  // Desaprobar un ramo y volver a bloquear los que dependan de él
  function desaprobarRamo(ramo) {
    const id = ramo.dataset.id;
    ramo.classList.remove('aprobado');

    const dependientes = getDependientes(id);
    dependientes.forEach(destino => {
      const prereqs = getPrerequisitos(destino);
      const todosAprobados = prereqs.every(reqId => {
        const req = document.querySelector(`.ramo[data-id="${reqId}"]`);
        return req && req.classList.contains('aprobado');
      });

      if (!todosAprobados) {
        destino.classList.add('bloqueado');
        destino.classList.remove('aprobado');
        desaprobarRamo(destino); // Recursivo
      }
    });
  }

  // Guardar progreso en localStorage
  function guardarProgreso() {
    try {
      const aprobados = Array.from(document.querySelectorAll('.ramo.aprobado'))
        .map(r => r.dataset.id)
        .filter(id => id);
      localStorage.setItem('ramosAprobados', JSON.stringify(aprobados));
    } catch (e) {
      console.error('Error al guardar progreso:', e);
    }
  }

  // Botón de reset si existe
  const resetBtn = document.getElementById('resetear');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('ramosAprobados');
      location.reload();
    });
  }
});
