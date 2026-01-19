"""
C:
Course-provided integration test sample.
This script calls the deployed services over HTTP (similar to what the grader uses).

Processes / base URLs:
- a: logs service (not called directly in this sample, printed for reference)
- b: users service
- c: costs service
- d: admin/about service

Important:
- The Costs service validates that user 123123 exists in Users service.
  Make sure user 123123 exists before running (per project submission requirement).
"""
import requests
import sys

filename = input("filename=")

# The first will handle the logs. (a)
# The second will handle all user-related tasks. (b)
# The third will handle all cost-related tasks. (c)
# The fourth will handle any admin-related tasks (e.g. developers details) (d)

a = "https://log-service-1oo2.onrender.com"
b = "https://user-services-fqb9.onrender.com"
c = "https://cost-service-1d44.onrender.com"
d = "https://admin-service-fjnz.onrender.com"

output = open(filename, "w")
sys.stdout = output

print("a=" + a)
print("b=" + b)
print("c=" + c)
print("d=" + d)

print()

print("testing getting the about")
print("-------------------------")

try:
    text = ""
    url = d + "/api/about/"
    data = requests.get(url)
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(data.json())
except Exception as e:
    print("problem")
    print(e)
print("")

print()
print("testing getting the report - 1")
print("------------------------------")

try:
    text = ""
    url = c + "/api/report/?id=123123&year=2026&month=1"
    data = requests.get(url)
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(text)
except Exception as e:
    print("problem")
    print(e)
print("")

print()
print("testing adding cost item")
print("----------------------------------")

try:
    text = ""
    url = c + "/api/add/"
    data = requests.post(
        url,
        json={"userid": 123123, "description": "milk 9", "category": "food", "sum": 8},
    )
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
except Exception as e:
    print("problem")
    print(e)
print("")

print()
print("testing getting the report - 2")
print("------------------------------")

try:
    text = ""
    url = c + "/api/report/?id=123123&year=2026&month=1"
    data = requests.get(url)
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(text)
except Exception as e:
    print("problem")
    print(e)
print("")