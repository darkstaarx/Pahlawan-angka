# Final Blow Hotspot Lock — v3.21.6

Do not align final-blow FX by transparent canvas centre.

Required pipeline:
1. identify currently visible enemy frame;
2. measure its rendered rectangle;
3. derive the FX artwork's visible alpha hotspot;
4. place that hotspot on the intended target point;
5. animate around that hotspot without horizontal drift.

Wira strike hotspot: visible lower strike mass.
Bunga root hotspot: lower opaque/root contact point pinned to enemy feet.
