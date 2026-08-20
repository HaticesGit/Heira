<FormField
  label="Date"
  icon="calendar"
>
  {Platform.OS === "web" ? (
    React.createElement("input", {
      type: "date",

      min: new Date()
        .toISOString()
        .split("T")[0],

      value: date
        ? `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(
            date.getDate()
          ).padStart(2, "0")}`
        : "",

      onChange: (event) => {
        const value =
          event.target.value;

        if (!value) {
          setDate(null);
          return;
        }

        const [
          year,
          month,
          day,
        ] = value
          .split("-")
          .map(Number);

        setDate(
          new Date(
            year,
            month - 1,
            day
          )
        );
      },

      style: {
        width: "100%",
        minHeight: 42,
        border: "none",
        outline: "none",
        padding: "0 12px",
        fontSize: 15,
        color: COLORS.blue,
        backgroundColor: "transparent",
        boxSizing: "border-box",
        cursor: "pointer",
      },
    })
  ) : (
    <>
      <TouchableOpacity
        style={styles.pickerInput}
        activeOpacity={0.8}
        onPress={() =>
          setShowDatePicker(true)
        }
      >
        <Text
          style={[
            styles.pickerText,
            !date &&
              styles.placeholderText,
          ]}
        >
          {date
            ? date.toLocaleDateString(
                "en-GB"
              )
            : "Choose a date"}
        </Text>

        <Ionicons
          name="calendar-outline"
          size={20}
          color={COLORS.blue}
        />
      </TouchableOpacity>

      {showDatePicker ? (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={(
            event,
            selectedDate
          ) => {
            setShowDatePicker(false);

            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      ) : null}
    </>
  )}
</FormField>