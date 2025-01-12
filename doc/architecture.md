About
========

The code uses a supervisor/worker style division of labor.
The worker is implemented using Web Workers, so a long-running
computation shouldn't block the UI.

Supervisor
===========

The supervisor handles interaction with the user and displaying the
results. When Python code needs to be executed, the supervisor
sends a work request to the worker and awaits a response.

Worker
=======

The worker executes Python code and also performs the CSG
computations.
