// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const ramos = document.querySelectorAll('.ramo');

  // Leer progreso guardado con manejo de errores
  let progreso = [];
  try {
    progreso = JSON.parse(localStorage.getItem('ramosAprobados')) || [];
  } catch (e) {
    console.error('Error al leer progreso:', e);
  }

  // Validación inicial de ramos bloqueados
  function validarBloqueosIniciales() {
    document.querySelectorAll('.ramo').forEach(ramo => {
      const prereqs = getPrerequisitos(ramo);
      
      if (prereqs.length > 0) {
        const todosAprobados = prereqs.every(id => {
          const req = document.querySelector(`.ramo[data-id="${id}"]`);
          return req && req.classList.contains('aprobado');
        });
        
        ramo.classList.toggle('bloqueado', !todosAprobados);
      }
    });
  }

  // Obtener prerequisitos de un ramo
  function getPrerequisitos(ramo) {
    return ramo.dataset.abre?.split(',')
      .map(id => id.trim())
      .filter(id => id) || [];
  }

  // Obtener ramos que dependen de un ID específico
  function getDependientes(id) {
    return Array.from(document.querySelectorAll('.ramo')).filter(r => {
      const abre = getPrerequisitos(r);
      return abre.includes(id);
    });
  }

  // Aplicar progreso guardado
  progreso.forEach(id => {
    const ramo = document.querySelector(`.ramo[data-id="${id}"]`);
    if (ramo) {
      aprobarRamo(ramo, false);
    }
  });

  // Validar bloqueos iniciales
  validarBloqueosIniciales();

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

    const abre = getPrerequisitos(ramo);
    abre.forEach(destinoId => {
      const destino = document.querySelector(`.ramo[data-id="${destinoId}"]`);
      if (destino) {
        const todosAprobados = getPrerequisitos(destino).every(id => {
          const req = document.querySelector(`.ramo[data-id="${id}"]`);
          return req && req.classList.contains('aprobado');
        });
        
        if (todosAprobados) {
          destino.classList.remove('bloqueado');
        }
      }
    });
  }

  function desaprobarRamo(ramo) {
    const id = ramo.dataset.id;
    ramo.classList.remove('aprobado');

    // Buscar todos los ramos que dependen de este
    const dependientes = getDependientes(id);
    
    dependientes.forEach(destino => {
      // Verificar si todos los prerequisitos están aprobados
      const requisitosIds = getPrerequisitos(destino);
      const todosAprobados = requisitosIds.every(reqId => {
        const req = document.querySelector(`.ramo[data-id="${reqId}"]`);
        return req && req.classList.contains('aprobado');
      });
      
      if (!todosAprobados) {
        destino.classList.add('bloqueado');
        if (destino.classList.contains('aprobado')) {
          desaprobarRamo(destino); // Recursividad para dependientes aprobados
        }
      }
    });
  }

  function guardarProgreso() {
    try {
      const aprobados = Array.from(document.querySelectorAll('.ramo.aprobado'))
        .map(r => r.dataset.id)
        .filter(id => id); // Filtrar IDs válidos
      localStorage.setItem('ramosAprobados', JSON.stringify(aprobados));
    } catch (e) {
      console.error('Error al guardar progreso:', e);
    }
  }
});
