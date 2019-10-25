install:
	- docker build -f Dockerfile.dev -t geelbe:1.0.0 \
		--build-arg GEELBE_API_CLIENT_ID="${CLIENT_ID}" \
		--build-arg GEELBE_API_CLIENT_SECRET="${CLIENT_SECRET}" \
		--build-arg GEELBE_API_SCOPE="Configuration Page Category Banner Product User PaymentMethod Country State City Carrier Order Campaign BlogPost Manufacturer NewsletterListUser PayUTarjeta PayUPSE PayUBaloto PayUEfecty PuntoRed MercadoPagoCreditCard MessageSubject Message VPElasticsearch Recommendation Discount UserAddress Email UserField" \
		--build-arg GEELBE_API_HOST="core.geelbe.com" .

run: 
	- docker stop geelbe-web
	- docker rm geelbe-web
	- docker run -p 3000:3000 --name "geelbe-web" -v $(pwd):/usr/src/geelbe -v /usr/src/geelbe/node_modules geelbe:1.0.0