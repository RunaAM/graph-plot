
LOW = 0
HIGH = 1
STEP = 0.01
REPAUS = 2
MAX_VALUE = 1023;
TOP_ROW =0;
BOTTOM_ROW = 1
HALF_OF_MAX_VALUE = MAX_VALUE/2;
THIRD_OF_MAX_VALUE = MAX_VALUE /3;
CONST_FOR_GETTING_FIVE_NUMBERS = 200;
NO_TIME = -1
FREQUENCES = [Math.PI/6,Math.PI/4, Math.PI/3, Math.PI/2,Math.PI,2*Math.PI];
LCD_ADDRESS = 39
NUMBER_PINS = 9
PHASES = [Math.PI/6,Math.PI/3,2 * Math.PI/3,Math.PI/2,Math.PI, 3 * Math.PI/2];

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
def init_device():
    led.enable(False);
    pins.set_pull(DigitalPin.P1, PinPullMode.PULL_UP);
    I2C_LCD1602.lcd_init(LCD_ADDRESS);
    I2C_LCD1602.on();
    datalogger.set_column_titles("timp", "y");

def delete_log():
    datalogger.delete_log()

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
    return NUMBER_PINS - (val + (NUMBER_PINS+1)/2)
    
def set_value(text: str):
    pause(1000)
    is_value = False;
    value = 0;
    I2C_LCD1602.clear();
    while(not is_value):
        choice = pins.analog_read_pin(AnalogPin.P0);
        value = int(choice /CONST_FOR_GETTING_FIVE_NUMBERS);
        render_text(text + value ,TOP_ROW, NO_TIME);
        if(pins.digital_read_pin(DigitalPin.P1) == LOW):
            is_value = True;
    return value;

def set_from_range(text:str, range):
    pause(1000);
    is_value = False;
    value = 0;
    I2C_LCD1602.clear();
    while(not is_value):
        choice = pins.analog_read_pin(AnalogPin.P0);
        if(range == "FREQUENCE"):
            value = FREQUENCES[int(choice/ CONST_FOR_GETTING_FIVE_NUMBERS)];
        else:
            value =PHASES[int(choice/ CONST_FOR_GETTING_FIVE_NUMBERS)];

        render_text(text + value,TOP_ROW, NO_TIME);
        if(pins.digital_read_pin(DigitalPin.P1) == LOW):
            is_value = True;
    return value

# main menu
def choose_program():
    is_menu = True;
    choice = 0
    while(is_menu):
        choice =pins.analog_read_pin(AnalogPin.P0);
        if(choice <= THIRD_OF_MAX_VALUE):
            render_text("oscilatie simpla",TOP_ROW,NO_TIME);
        elif(choice <= 2 * THIRD_OF_MAX_VALUE):
            render_text("fenomen de batai",TOP_ROW,NO_TIME);
        elif(choice <=MAX_VALUE):
            render_text("curbe  lissajous", TOP_ROW,NO_TIME);

        if(pins.digital_read_pin(DigitalPin.P1) == LOW):
            is_menu = False;
    
    if(choice <= THIRD_OF_MAX_VALUE):
        configure_oscilatii_simpla()
    elif(choice <= 2 * THIRD_OF_MAX_VALUE):
        configure_fenomen_batai()
    elif(choice <=MAX_VALUE):
        configure_curbe_lissajous();


def configure_curbe_lissajous():
    amplitudine1 = set_value("amp1 = ");
    amplitudine2 = set_value("amp2 = ");

    frecventa1 = set_from_range("frec1 = ", "FREQUENCE");
    frecventa2 = set_from_range("frec2 = ", "FREQUENCE");

    faza1 = set_from_range("faza1 = ","PHASE");
    faza2 = set_from_range("faza2 = ","PHASE");


    durata = set_value("durata*10 = ");

    curbele_lissajous(amplitudine1, amplitudine2, frecventa1,
     frecventa2, faza1, faza2, durata);
def configure_fenomen_batai():
    
    amplitude = set_value("amp =");
    frequence1 = set_from_range("frec1 = ","FREQUENCE");
    frequence2 = set_from_range("frec2 = ","FREQUENCE");
    duration = 10* set_value("durata*10 = ")

    fenomen_batai(amplitude, frequence1, frequence2, duration);

def configure_oscilatii_simpla():
    amplitude = set_value("amp = ");
    frequence = set_from_range("frec = ", "FREQUENCE");
    duration = set_value("durata*10 = ");

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


def curbele_lissajous(amplitudine1:number, amplitudine2:number, frecventa1:number,frecventa2:number,faza1:number,faza2:number,durata:number):
    timp = 0.01;
    while timp<=durata:
        pin_id1 = amplitudine1 * Math.sin(frecventa1*timp + faza1);
        pin_id2 = amplitudine2 * Math.sin(frecventa2*timp +faza2);
        datalogger.log(datalogger.create_cv("timp",pin_id1), datalogger.create_cv("y",pin_id2));
        print(pin_id1 + " " + pin_id2);
        plot_point(pin_id1);
        timp +=STEP
#process the values to whole numbers and plots on the leds
def plot_point(pin_id: number):
    pin_id = Math.floor(pin_id)
    pin_id /=2
    pin_id = calculate_pin_id(pin_id)
    draw_pin(pin_id, HIGH)
    pause(REPAUS)
    draw_pin(pin_id, LOW)





input.on_button_pressed(Button.A, delete_log);

init_device()
render_text("screen init ",TOP_ROW, NO_TIME);
render_text("completed",BOTTOM_ROW,3000)

choose_program();

render_text("program terminat",TOP_ROW, NO_TIME);


