# fanta-mercato

Piattaforma di gestione asta online per il tuo fantacalcio.

---

## 🚀 Guida all'Avvio del Progetto

Questa guida ti aiuterà a configurare ed avviare l'intera piattaforma di `fanta-mercato` in un ambiente locale utilizzando Docker Compose.

### Requisiti

- **Docker** e **Docker Compose** installati sul tuo sistema.

### Configurazione Iniziale

1.  **File `.env`**: Assicurati che un file `.env` sia presente nella cartella principale del progetto e che contenga tutte le variabili d'ambiente necessarie per i servizi.

2.  **Genera i Certificati**: Keycloak richiede certificati per la comunicazione sicura (HTTPS) in modalità di produzione. Genera un certificato self-signed per l'ambiente locale.

    Apri il terminale nella cartella `keycloak/https` del tuo progetto ed esegui il seguente comando `openssl` per generare una chiave privata (`key.pem`) e un certificato self-signed (`cert.pem`).

    ```bash
    openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out cert.pem -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,DNS:keycloak"
    ```

    - **`key.pem`**: La chiave privata del tuo server.
    - **`cert.pem`**: Il certificato self-signed.
    - **`-days 365`**: Imposta la validità del certificato a un anno.
    - **`/CN=localhost`**: Imposta il nome comune del certificato su `localhost`, che è l'hostname che userai per l'accesso.

3.  Copia il risultato anche nella cartella `backend/certs`

### Avvio del Progetto

Una volta completata la configurazione iniziale, puoi avviare l'intera architettura con un solo comando.

1.  **Avvia i servizi**: Apri il terminale nella root del progetto ed esegui:

    ```bash
    docker-compose up -d
    ```

    - **`up`**: Avvia tutti i servizi definiti nel file `docker-compose.yml`.
    - **`-d`**: Esegue i container in background.

2.  **Controlla lo stato**: Per verificare che tutti i servizi siano in esecuzione, usa il seguente comando:
    ```bash
    docker-compose ps
    ```

---

## 🛠️ Architettura dei Servizi

L'applicazione è composta da quattro servizi principali che comunicano tra loro:

- **`keycloak`**: Servizio di autenticazione e autorizzazione.
- **`postgres`**: Database relazionale per l'archiviazione dei dati.
- **`backend`**: Il server dell'applicazione (API).
- **`frontend`**: L'interfaccia utente web.

---

## ⚙️ Manutenzione e Debug

- **Riavviare i servizi**: Se hai bisogno di riavviare un servizio, ad esempio `backend`:
  ```bash
  docker-compose restart backend
  ```
- **Vedere i log**: Per visualizzare i log di un servizio, ad esempio `keycloak`:
  ```bash
  docker-compose logs keycloak
  ```
- **Fermare i servizi**: Per fermare tutti i container:
  ```bash
  docker-compose down
  ```
- **Pulizia completa**: Per fermare i container e rimuovere i volumi e le immagini, utile per un riavvio "pulito":
  ```bash
  docker-compose down -v --rmi all
  ```

# Keycloak Login

## Access

To log in to the Keycloak admin console, navigate to the following URL in your browser:

`https://localhost:8443/admin/`

---

## Troubleshooting

### Certificate Warning

Since you are using a self-signed certificate, your browser will show a security warning. You can safely proceed by accepting the certificate.

### Cannot access the page

If the page doesn't load, make sure that the Keycloak container is running and that your firewall is not blocking port `8443`.
