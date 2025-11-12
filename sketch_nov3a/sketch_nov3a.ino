#define SENSOR_PIN 2

void setup() {
  Serial.begin(9600);
  pinMode(SENSOR_PIN, INPUT);
}

void loop() {
  int state = digitalRead(SENSOR_PIN);
  Serial.println(state);  // 1 = detected, 0 = no detection
  delay(100); // 10 readings per second
}