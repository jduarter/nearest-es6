Ported from jQuery Nearest plugin v1.4.0 (2011-2015 Gilmore Davidson under the MIT licence)
   http://gilmoreorless.github.io/jquery-nearest/LICENSE.txt

Ported to pure ES6 by: Jorge Duarte Rodriguez <info@malagadev.com>
August 2018


1. Import module.

import Nearest from './Classes/Nearest'

2. Create new instance.

      let nearest = new Nearest({
        x: xPosition,
        y: yPosition
      }, '.filterSelector', document.getElementById('parentDomElement'))


