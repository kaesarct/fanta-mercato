#!/bin/bash

# Esegue il build di Keycloak con il database specificato
/opt/keycloak/bin/kc.sh build --db=postgres

# Avvia il server con il flag hostname-strict
/opt/keycloak/bin/kc.sh start --import-realm --optimized --hostname-strict=false

# Impedisce al container di uscire, mantenendolo in esecuzione
tail -f /dev/null