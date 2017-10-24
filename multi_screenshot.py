import requests, json, time

username = "daniel.giordano@smartbear.com"
password  = "motdemo"
my_auth = (username, password)
baseUrl = "https://crossbrowsertesting.com/api/v3/screenshots"
try:
	params = {}
	params["browser_list_name"] = "Latest Browsers"
	params["delay"] = 5
	params["url"] = "https://www.crossbrowsertesting.com"

	response = requests.post(baseUrl,auth=my_auth,params=params)

	params["browser_list_name"] = "Latest Browsers"
	params["delay"] = 5
	params["url"] = "https://crossbrowsertesting.com/freetrial"

	response = requests.post(baseUrl,auth=my_auth,params=params)
	print("Screenshots started successfully!")
except Exception as e:
	print("Error taking screenshots")
	print(e)