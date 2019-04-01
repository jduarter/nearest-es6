Ported from jQuery Nearest plugin v1.4.0 (2011-2015 Gilmore Davidson under the MIT licence)
   http://gilmoreorless.github.io/jquery-nearest/LICENSE.txt

Ported to pure ES6 (jQuery is not longer needed!) by:
2018-2019 Jorge Duarte Rodriguez <info@malagadev.com> under the MIT license


1. Import module.

import Nearest from './Classes/Nearest'

2. Create new instance.

      let nearest = new Nearest({
        x: xPosition,
        y: yPosition
      }, '.filterSelector', document.getElementById('parentDomElement'))


