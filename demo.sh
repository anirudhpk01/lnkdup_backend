#!/bin/bash

# === CONFIG ===
APP_NAME=url-shortener
IMAGE_NAME=url-shortener:latest
NAMESPACE=default
DEPLOYMENT_FILE=app-deployment.yaml
SERVICE_FILE=app-service.yaml
REDIS_FILE=redis-deployment.yaml
INGRESS_FILE=ingress.yaml
HPA_FILE=hpa.yaml

echo "🚀 Starting Minikube..."
minikube start --driver=docker

echo "🔁 Using Minikube's Docker daemon..."
eval $(minikube docker-env)

echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "📦 Applying Redis deployment..."
kubectl apply -f $REDIS_FILE

echo "🚀 Applying backend deployment and service..."
kubectl apply -f $DEPLOYMENT_FILE
kubectl apply -f $SERVICE_FILE

echo "🌐 Applying Ingress controller..."
minikube addons enable ingress
sleep 5
kubectl apply -f $INGRESS_FILE

echo "📈 Applying HPA..."
kubectl apply -f $HPA_FILE

echo "⏳ Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=$APP_NAME --timeout=90s

echo "🌍 Fetching Minikube IP..."
MINIKUBE_IP=$(minikube ip)
echo "✅ Ingress URL: http://$MINIKUBE_IP/api/upload"

echo "📊 (Optional) Start metrics server if not already installed:"
echo "kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"

echo ""
echo "🧪 To run the stress test:"
echo "autocannon -c 50 -d 60 -p 10 http://$MINIKUBE_IP/api/upload"
echo ""
echo "📺 Watch logs in different pods:"
echo "kubectl get pods"
echo "kubectl logs -f <pod-name>"
echo ""
echo "📈 Watch HPA scaling:"
echo "kubectl get hpa -w"
echo ""
echo "📉 Watch CPU usage:"
echo "kubectl top pods"
