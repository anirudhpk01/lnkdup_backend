URL Shortener

Steps to run:

1. Start Docker
2. minikube start
3. Build the docker image
docker build -t urlshortener-app .
4. Tag the image for DockerHub
docker tag urlshortener:latest <your-dockerhub-username>/urlshortener:latest
5. Push the image to DockerHub
docker push urlshortener:latest
(If things dont work:
kubectl set image deployment/urlshortener urlshortener=<your-dockerhub-username>/urlshortener:latest
kubectl rollout restart deployment/urlshortener
kubectl logs <pod-name>
)
Apply Kubernetes configs:
6. kubectl apply -f redis-deployment.yaml
7. kubectl apply -f configmap.yaml
8. kubectl apply -f secret.yaml
9. kubectl apply -f urlshortener-deployment.yaml
10. kubectl apply -f service.yaml
11. Check pod status
kubectl get pods
12. Check service name and port
kubectl get svc
13. To get service URL
    - Option 1:
      minikube service urlshortener-service --url
    - Option 2:
      kubectl port-forward service/urlshortener-service 3000:80
14. Test with curl:
    curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"link": "https://example.com"}'

Note: If you have used Option 1 in step 13, then use the URL returned by minikube service in place of http://localhost:3000

