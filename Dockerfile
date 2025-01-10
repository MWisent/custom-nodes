FROM n8nio/n8n:latest

# Kopiuj wszystkie pliki do kontenera
COPY . /custom-nodes/

USER root
RUN chown -R node:node /custom-nodes/

USER node
WORKDIR /custom-nodes

# Instalacja zależności
RUN npm install

# Tworzenie katalogu na custom nodes
RUN mkdir -p /home/node/.n8n/custom

# Kopiowanie plików z odpowiednich lokalizacji
RUN cp -r /custom-nodes/CustomGetPriceData.js /home/node/.n8n/custom/
RUN cp -r /custom-nodes/CustomGetNewsData.js /home/node/.n8n/custom/
RUN cp -r /custom-nodes/CustomNotifications.js /home/node/.n8n/custom/
RUN cp -r /custom-nodes/CustomRiskManager.js /home/node/.n8n/custom/
RUN cp -r /custom-nodes/CustomSentimentAnalysis.js /home/node/.n8n/custom/
RUN cp -r /custom-nodes/CustomSignalGenerator.js /home/node/.n8n/custom/
RUN cp -r /custom-nodes/CustomTechnicalIndicators.js /home/node/.n8n/custom/
RUN cp -r /custom-nodes/CustomTradeHandler.js /home/node/.n8n/custom/
RUN cp -r /custom-nodes/src/CustomKAGSystem.js /home/node/.n8n/custom/

# Zmienne środowiskowe dla n8n
ENV N8N_PORT=${N8N_PORT}
ENV N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
ENV N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}

# Zmienne środowiskowe dla brokera
ENV BROKER_API_KEY=${BROKER_API_KEY}
ENV BROKER_API_SECRET=${BROKER_API_SECRET}
ENV BROKER_API_URL=${BROKER_API_URL}

# Zmienne środowiskowe dla Telegrama
ENV TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
ENV TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}

# Zmienne dla CustomGetPriceData
ENV PRICE_DATA_API_URL=${PRICE_DATA_API_URL}
ENV PRICE_DATA_INTERVAL=${PRICE_DATA_INTERVAL}

# Zmienne dla CustomGetNewsData
ENV NEWS_API_KEY=${NEWS_API_KEY}
ENV NEWS_SOURCES=${NEWS_SOURCES}

# Zmienne dla CustomRiskManager
ENV MAX_POSITION_SIZE=${MAX_POSITION_SIZE}
ENV RISK_PERCENTAGE=${RISK_PERCENTAGE}
ENV STOP_LOSS_PERCENTAGE=${STOP_LOSS_PERCENTAGE}

# Zmienne dla CustomSignalGenerator
ENV SIGNAL_TIMEFRAME=${SIGNAL_TIMEFRAME}
ENV SIGNAL_THRESHOLD=${SIGNAL_THRESHOLD}

# Zmienne dla CustomKAGSystem
ENV KAG_ANALYSIS_DEPTH=${KAG_ANALYSIS_DEPTH}
ENV KAG_CONFIDENCE_THRESHOLD=${KAG_CONFIDENCE_THRESHOLD}

# Port
EXPOSE ${N8N_PORT}

# Uruchomienie n8n
CMD ["n8n", "start"] 