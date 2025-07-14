document.addEventListener('DOMContentLoaded', () => {
  const ramos = document.querySelectorAll('.ramo');

  // Leer progreso guardado
  let progreso = [];
  try {
    progreso = JSON.parse(localStorage.getItem('ramosAprobados')) || [];
  } catch (e) {
    console.error('Error al leer progreso:', e);
  }

  // Función para obtener prerrequisitos de un ramo
  function getPrerequisitos(ramo) {
    if (!ramo.dataset.abre) return [];
    return ramo.dataset.abre.split(',')
      .map(id => id.trim())
      .filter(id => id);
  }

  // Función para validar estado inicial de los ramos
  function validarEstadosIniciales() {
    ramos.forEach(ramo => {
      const tienePrerrequisitos = ramo.dataset.abre && ramo.dataset.abre.trim() !== '';
      
      // Solo validar bloqueo si tiene prerrequisitos declarados
      if (tienePrerrequisitos) {
        const prerequisitos = getPrerequisitos(ramo);
        const todosAprobados = prerequisitos.every(id => {
          const req = document.querySelector(`.ramo[data-id="${id}"]`);
          return req && req.classList.contains('aprobado');
        });
        
        ramo.classList.toggle('bloqueado', !todosAprobados);
      } else {
        // Ramo sin prerrequisitos nunca debe estar bloqueado
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

  // Validar estados iniciales
  validarEstadosIniciales();

  // Función para obtener ramos dependientes
  function getDependientes(id) {
    return Array.from(ramos).filter(ramo => {
      const prereqs = getPrerequisitos(ramo);
      return prereqs.includes(id);
    });
  }

  // Manejo de clic
  ramos.forEach(ramo => {
    ramo.addEventListener('click', () => {
      // No hacer nada si está bloqueado
      if (ramo.classList.contains('bloqueado')) return;
      
      if (ramo.classList.contains('aprobado')) {
        desaprobarRamo(ramo);
      } else {
        aprobarRamo(ramo);
      }
      
      guardarProgreso();
    });
  });

  function aprobarRamo(ramo) {
    ramo.classList.add('aprobado');
    
    // Desbloquear ramos que dependan de este
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

  function desaprobarRamo(ramo) {
    const id = ramo.dataset.id;
    ramo.classList.remove('aprobado');
    
    // Bloquear y desaprobar ramos dependientes
    const dependientes = getDependientes(id);
    
    dependientes.forEach(destino => {
      // Solo si estaba aprobado
      if (destino.classList.contains('aprobado')) {
        destino.classList.add('bloqueado');
        desaprobarRamo(destino); // Recursivo para dependientes
      } else {
        const prereqs = getPrerequisitos(destino);
        const todosAprobados = prereqs.every(reqId => {
          const req = document.querySelector(`.ramo[data-id="${reqId}"]`);
          return req && req.classList.contains('aprobado');
        });
        
        destino.classList.toggle('bloqueado', !todosAprobados);
      }
    });
  }

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
});
