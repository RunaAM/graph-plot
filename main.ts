let LOW = 0
let HIGH = 1
let STEP = 0.01
let REPAUS = 2
let MAX_VALUE = 1023
let TOP_ROW = 0
let BOTTOM_ROW = 1
let HALF_OF_MAX_VALUE = MAX_VALUE / 2
let CONST_FOR_GETTING_FIVE_NUMBERS = 200
let NO_TIME = -1
let FREQUENCES = [Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2, Math.PI, 2 * Math.PI]
let LCD_ADDRESS = 39
//  array of where are the leds connected
let OUTPUTS = [DigitalPin.P2, DigitalPin.P3, DigitalPin.P4, DigitalPin.P6, DigitalPin.P7, DigitalPin.P8, DigitalPin.P9, DigitalPin.P10, DigitalPin.P12]
//  initialise the lcd screen and repurpose the GPIO pins for external use
function init_screen() {
    led.enable(false)
    pins.setPull(DigitalPin.P1, PinPullMode.PullUp)
    I2C_LCD1602.LcdInit(LCD_ADDRESS)
    I2C_LCD1602.on()
    datalogger.setColumnTitles("timp", "y")
}

//  shows text on the lcd screen for a certain period of time
function render_text(val: string, row: number, time: number) {
    I2C_LCD1602.ShowString(val, 0, row)
    if (time != NO_TIME) {
        pause(time)
        I2C_LCD1602.clear()
    }
    
}

//  set value HIGH or LOW to a pin (sets the led state to on or off)
function draw_pin(pin: number, value: number) {
    pins.digitalWritePin(OUTPUTS[pin], value)
}

//  a simple function for getting the correct pin number
function calculate_pin_id(val: number): number {
    return 9 - (val + 5)
}

function set_frequence(text: string): number {
    let choice: number;
    pause(1000)
    let is_frequence = false
    let frequence = 0
    I2C_LCD1602.clear()
    while (!is_frequence) {
        choice = pins.analogReadPin(AnalogPin.P0)
        frequence = FREQUENCES[Math.trunc(choice / CONST_FOR_GETTING_FIVE_NUMBERS)]
        render_text(text + frequence, TOP_ROW, NO_TIME)
        if (pins.digitalReadPin(DigitalPin.P1) == LOW) {
            is_frequence = true
        }
        
    }
    return frequence
}

function set_amplitude(): number {
    let choice: number;
    pause(1000)
    let is_amplitude = false
    let amplitude = 0
    I2C_LCD1602.clear()
    while (!is_amplitude) {
        choice = pins.analogReadPin(AnalogPin.P0)
        amplitude = Math.trunc(choice / CONST_FOR_GETTING_FIVE_NUMBERS)
        render_text("amp = " + amplitude, TOP_ROW, NO_TIME)
        if (pins.digitalReadPin(DigitalPin.P1) == LOW) {
            is_amplitude = true
        }
        
    }
    return amplitude
}

function set_duration(): number {
    let choice: number;
    let is_duration = false
    let duration = 0
    I2C_LCD1602.clear()
    while (!is_duration) {
        choice = pins.analogReadPin(AnalogPin.P0)
        duration = Math.trunc(choice / CONST_FOR_GETTING_FIVE_NUMBERS) * 10
        render_text("duration = " + duration, TOP_ROW, NO_TIME)
        if (pins.digitalReadPin(DigitalPin.P1) == LOW) {
            is_duration = true
        }
        
    }
    return duration
}

//  main menu
function choose_program() {
    let is_menu = true
    let choice = 0
    while (is_menu) {
        choice = pins.analogReadPin(AnalogPin.P0)
        if (choice < HALF_OF_MAX_VALUE) {
            render_text("oscilatie simpla", TOP_ROW, NO_TIME)
        } else if (choice >= HALF_OF_MAX_VALUE) {
            render_text("fenomen de batai", TOP_ROW, NO_TIME)
        }
        
        if (pins.digitalReadPin(DigitalPin.P1) == LOW) {
            is_menu = false
        }
        
    }
    if (choice < HALF_OF_MAX_VALUE) {
        configure_oscilatii_simpla()
    } else {
        configure_fenomen_batai()
    }
    
}

function configure_fenomen_batai() {
    let amplitude = set_amplitude()
    let frequence1 = set_frequence("freq1 = ")
    let frequence2 = set_frequence("freq2 = ")
    let duration = set_duration()
    fenomen_batai(amplitude, frequence1, frequence2, duration)
}

function configure_oscilatii_simpla() {
    let amplitude = set_amplitude()
    let frequence = set_frequence("freq = ")
    let duration = set_duration()
    oscilatie_simpla(amplitude, frequence, duration)
}

function oscilatie_simpla(amplitudine: number, frecventa: number, durata: number) {
    let pin_id: number;
    let timp = 0.01
    while (timp <= durata) {
        pin_id = amplitudine * Math.sin(frecventa * timp)
        datalogger.log(datalogger.createCV("timp", timp), datalogger.createCV("y", pin_id))
        console.log(pin_id)
        pin_id = Math.floor(pin_id)
        pin_id = calculate_pin_id(pin_id)
        draw_pin(pin_id, HIGH)
        pause(REPAUS)
        draw_pin(pin_id, LOW)
        timp += STEP
    }
}

function fenomen_batai(amplitudine: number, frecventa1: number, frecventa2: number, durata: number) {
    let pin_id: number;
    let timp = 0.01
    let dfrec = (frecventa1 - frecventa2) / (2 * Math.PI)
    let frec = (frecventa2 + frecventa1) / 2
    while (timp <= durata) {
        pin_id = 2 * amplitudine * Math.cos(dfrec * timp) * Math.sin(frec * timp)
        datalogger.log(datalogger.createCV("timp", timp), datalogger.createCV("y", pin_id))
        console.log(pin_id)
        plot_point(pin_id)
        timp += STEP
    }
}

// process the values to whole numbers and plots on the leds
function plot_point(pin_id: number) {
    pin_id = Math.floor(pin_id)
    pin_id /= 2
    pin_id = calculate_pin_id(pin_id)
    draw_pin(pin_id, HIGH)
    pause(REPAUS)
    draw_pin(pin_id, LOW)
}

init_screen()
render_text("screen init ", TOP_ROW, NO_TIME)
render_text("completed", BOTTOM_ROW, 3000)
choose_program()
render_text("program terminat", TOP_ROW, 10000)
