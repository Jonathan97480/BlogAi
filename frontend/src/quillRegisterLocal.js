import Quill from 'quill';
import ImageResize from 'quill-image-resize-module-react';

// Enregistrement du module uniquement si pas déjà fait
if (!Quill.imports['modules/imageResize']) {
    Quill.register('modules/imageResize', ImageResize);
}
