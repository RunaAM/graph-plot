
LOW = 0
HIGH = 1
STEP = 0.01
REPAUS = 2
MAX_VALUE = 1023;
TOP_ROW =0;
BOTTOM_ROW = 1
HALF_OF_MAX_VALUE = MAX_VALUE/2;
CONST_FOR_GETTING_FIVE_NUMBERS = 200;
NO_TIME = -1
FREQUENCES = [Math.PI/6,Math.PI/4, Math.PI/3, Math.PI/2,Math.PI,2*Math.PI];
LCD_ADDRESS = 39

# array of where are the leds connected
OUTPUTS = [DigitalPin.P2,
    DigitalPin.P3,
    DigitalPin.P4,
    DigitalPin.P6,
    DigitalPin.P7,
    DigitalPin.P8,
    DigitalPin.P9,
    DigitalPin.P10,
    DigitalPin.P12]

# initialise the lcd screen and repurpose the GPIO pins for external use
def init_screen():
    led.enable(False)
    pins.set_pull(DigitalPin.P1, PinPullMode.PULL_UP)
    I2C_LCD1602.lcd_init(LCD_ADDRESS)
    I2C_LCD1602.on()
    datalogger.set_column_titles("timp", "y")

# shows text on the lcd screen for a certain period of time
def render_text(val: str,row, time):
    I2C_LCD1602.show_string(val, 0, row)
    if(time !=NO_TIME):
        pause(time)
        I2C_LCD1602.clear()



# set value HIGH or LOW to a pin (sets the led state to on or off)
def draw_pin(pin: number, value: number):
    pins.digital_write_pin(OUTPUTS[pin], value)

# a simple function for getting the correct pin number
def calculate_pin_id(val: number):
    return 9 - (val + 5)
    
def set_frequence(text:str):
    pause(1000);
    is_frequence = False;
    frequence = 0;
    I2C_LCD1602.clear();
    while(not is_frequence):
        choice = pins.analog_read_pin(AnalogPin.P0);
        frequence = FREQUENCES[int(choice/ CONST_FOR_GETTING_FIVE_NUMBERS)];
        render_text(text + frequence,TOP_ROW, NO_TIME);
        if(pins.digital_read_pin(DigitalPin.P1) == LOW):
            is_frequence = True;
    return frequence

def set_amplitude():
    pause(1000)
    is_amplitude = False;
    amplitude = 0;
    I2C_LCD1602.clear();
    while(not is_amplitude):
        choice = pins.analog_read_pin(AnalogPin.P0);
        amplitude = int(choice /CONST_FOR_GETTING_FIVE_NUMBERS);
        render_text("amp = " + amplitude ,TOP_ROW, NO_TIME);
        if(pins.digital_read_pin(DigitalPin.P1) == LOW):
            is_amplitude = True;
    return amplitude;

def set_duration():
    is_duration = False;
    duration = 0;
    I2C_LCD1602.clear();
    while(not is_duration):
        choice = pins.analog_read_pin(AnalogPin.P0);
        duration = int(choice/CONST_FOR_GETTING_FIVE_NUMBERS) * 10;
        render_text("duration = " +duration,TOP_ROW, NO_TIME);
        if(pins.digital_read_pin(DigitalPin.P1) == LOW):
            is_duration = True;
    return duration;
# main menu
def choose_program():
    is_menu = True;
    choice = 0
    while(is_menu):
        choice =pins.analog_read_pin(AnalogPin.P0);
        if(choice < HALF_OF_MAX_VALUE):
            render_text("oscilatie simpla",TOP_ROW,NO_TIME);
        elif(choice >= HALF_OF_MAX_VALUE):
            render_text("fenomen de batai",TOP_ROW,NO_TIME);
        if(pins.digital_read_pin(DigitalPin.P1) == LOW):
            is_menu = False;
    
    if(choice < HALF_OF_MAX_VALUE):
        configure_oscilatii_simpla();
    else:
        configure_fenomen_batai();

def configure_fenomen_batai():
    
    amplitude = set_amplitude();
    frequence1 = set_frequence("freq1 = ")
    frequence2 = set_frequence("freq2 = ")
    duration = set_duration();

    fenomen_batai(amplitude, frequence1, frequence2, duration);

def configure_oscilatii_simpla():
    amplitude = set_amplitude();
    frequence = set_frequence("freq = ");
    duration = set_duration();

    oscilatie_simpla(amplitude,frequence,duration);

def oscilatie_simpla(amplitudine: number, frecventa: number, durata: number):
    timp = 0.01
    while timp <= durata:
        pin_id = amplitudine * Math.sin(frecventa * timp)
        datalogger.log(datalogger.create_cv("timp", timp),
            datalogger.create_cv("y", pin_id))
        print(pin_id)
        pin_id = Math.floor(pin_id)
        pin_id = calculate_pin_id(pin_id)
        draw_pin(pin_id, HIGH)
        pause(REPAUS)
        draw_pin(pin_id, LOW)
        timp += STEP
def fenomen_batai(amplitudine: number, frecventa1: number, frecventa2: number, durata: number):
    timp = 0.01
    dfrec = (frecventa1 - frecventa2) / (2 * Math.PI)
    frec = (frecventa2 + frecventa1) / 2
    while timp <= durata:
        pin_id = 2 * amplitudine * Math.cos(dfrec * timp) * Math.sin(frec * timp)
        datalogger.log(datalogger.create_cv("timp", timp),
            datalogger.create_cv("y", pin_id))
        print(pin_id)
        plot_point(pin_id)
        timp += STEP

#process the values to whole numbers and plots on the leds
def plot_point(pin_id: number):
    pin_id = Math.floor(pin_id)
    pin_id /=2
    pin_id = calculate_pin_id(pin_id)
    draw_pin(pin_id, HIGH)
    pause(REPAUS)
    draw_pin(pin_id, LOW)





init_screen()
render_text("screen init ",TOP_ROW, NO_TIME);
render_text("completed",BOTTOM_ROW,3000)

choose_program();

render_text("program terminat",TOP_ROW, 10000);