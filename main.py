# initialise the lcd screen
def init_screen():
    led.enable(False)
    I2C_LCD1602.lcd_init(39)
    I2C_LCD1602.on()
    datalogger.set_column_titles("timp", "y")

#set value HIGH or LOW to a pin (sets the led state to on or off)
def draw_pin(pin: number, value: number):
    pins.digital_write_pin(outputs[pin], value)

# a simple function 
def calculate_pin_id(val: number):
    return 9 - (val+5);

# shows text on the lcd screen for a certain period of time
def render_text(val: string, time: number):
    I2C_LCD1602.show_string(val, 0, 0);
    pause(time);
    I2C_LCD1602.clear();


outputs = [DigitalPin.P0,
    DigitalPin.P1,
    DigitalPin.P2,
    DigitalPin.P12,
    DigitalPin.P4,
    DigitalPin.P10,
    DigitalPin.P6,
    DigitalPin.P7,
    DigitalPin.P8]

init_screen()

render_text("ecran initializat",1000);

def oscilatie_simpla(amplitudine: number,frecventa:number,durata:number):
    timp = 0.01;
    while(timp <=durata):
        pin_id = amplitudine * Math.sin(frecventa * timp);
        datalogger.log(datalogger.create_cv("timp", timp),
                     datalogger.create_cv("y", pin_id));
        print(pin_id)
        pin_id = Math.floor(pin_id);
        pin_id = calculate_pin_id(pin_id);
        draw_pin(pin_id, 1);
        pause(5);
        draw_pin(pin_id, 0);
        timp+=0.01

render_text("program terminat",10000);